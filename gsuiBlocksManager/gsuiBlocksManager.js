"use strict";

class gsuiBlocksManager {
	constructor( root, opts ) {
		this.rootElement = root;
		this.timeline = new gsuiTimeline();

		this._opts = opts;
		this._opts.onscrollRows = opts.onscrollRows || GSUI.noop;
		this._opts.oneditBlock = opts.oneditBlock || GSUI.noop;
		this._opts.oninputLoop = opts.oninputLoop || GSUI.noop;
		this._opts.onchangeLoop = opts.onchangeLoop || GSUI.noop;
		this._opts.oninputCurrentTime = opts.oninputCurrentTime || GSUI.noop;
		this._opts.onchangeCurrentTime = opts.onchangeCurrentTime || GSUI.noop;
		this._blockDOMChange = opts.blockDOMChange;
		this.__offset = 0;
		this.__fontSize = 16;
		this.__blcs = new Map();
		this.__blcsEditing = new Map();
		this.__blcsSelected = new Map();
		this.__uiPanels = new gsuiPanels( root );
		this.__elPanGridWidth = 0;
		this.__magnet = root.querySelector( ".gsuiBlocksManager-magnet" );
		this.__elLoopA = root.querySelector( ".gsuiBlocksManager-loopA" );
		this.__elLoopB = root.querySelector( ".gsuiBlocksManager-loopB" );
		this.__selection = root.querySelector( ".gsuiBlocksManager-selection" );
		this.__elPanGrid = root.querySelector( ".gsuiBlocksManager-gridPanel" );
		this.__magnetValue = root.querySelector( ".gsuiBlocksManager-magnetValue" );
		this.__sideContent = root.querySelector( ".gsuiBlocksManager-sidePanelContent" );
		this.__elCurrentTime = root.querySelector( ".gsuiBlocksManager-currentTime" );
		this.__rowsContainer = root.querySelector( ".gsuiBlocksManager-rows" );
		this.__rowsWrapinContainer = root.querySelector( ".gsuiBlocksManager-rowsWrapin" );
		this.__rows = this.__rowsContainer.getElementsByClassName( "gsui-row" );
		this.__uiBeatlines = root.querySelector( "gsui-beatlines" );

		this.__elPanGrid.onresizing = this.__gridPanelResizing.bind( this );
		this.timeline.oninputLoop = this.__loop.bind( this );
		this.timeline.onchangeLoop = ( isLoop, a, b ) => this._opts.onchangeLoop( isLoop, a, b );
		this.timeline.onchangeCurrentTime = t => {
			this.__currentTime( t );
			this._opts.onchangeCurrentTime( t );
		};
		root.querySelector( ".gsuiBlocksManager-timelineWrap" ).append( this.timeline.rootElement );

		this.__rowsContainer.oncontextmenu =
		root.ondragstart = () => false;
		root.onkeydown = this.__keydown.bind( this );
		this.__magnet.onclick = this.__onclickMagnet.bind( this );

		this.__rowsScrollTop =
		this.__rowsScrollLeft = -1;
		this.__sideContent.onwheel = this.__onwheelPanelContent.bind( this );
		this.__sideContent.onscroll = this.__onscrollPanelContent.bind( this );
		this.__rowsContainer.onwheel = this.__onwheelRows.bind( this );
		this.__rowsContainer.onscroll = this.__onscrollRows.bind( this );
		root.onwheel = e => { e.ctrlKey && e.preventDefault(); };

		this.__eventReset();
		this.timeline.timeSignature( 4, 4 );
		this.__uiBeatlines.setAttribute( "timesignature", "4,4" );
		this.__magnetValue.textContent = this.timeline.stepRound;
	}

	// Public methods
	// ............................................................................................
	timeSignature( a, b ) {
		this.timeline.timeSignature( a, b );
		this.__uiBeatlines.setAttribute( "timesignature", `${ a },${ b }` );
	}
	currentTime( beat ) {
		this.timeline.currentTime( beat );
		this.__currentTime( beat );
	}
	loop( a, b ) {
		this.timeline.loop( a, b );
		this.__loop( Number.isFinite( a ), a, b );
	}
	setPxPerBeat( px ) {
		const ppb = Math.round( Math.min( Math.max( 8, px ) ), 512 );

		if ( ppb !== this.__pxPerBeat ) {
			const ppbpx = `${ ppb }px`;

			this.__pxPerBeat = ppb;
			this.timeline.offset( this.__offset, ppb );
			this.__uiBeatlines.setAttribute( "pxperbeat", ppb );
			this.__elLoopA.style.fontSize =
			this.__elLoopB.style.fontSize =
			this.__elCurrentTime.style.fontSize = ppbpx;
			Array.from( this.__rows ).forEach( el => el.firstElementChild.style.fontSize = ppbpx );
			if ( this._opts.onchangePxPerBeat ) {
				this._opts.onchangePxPerBeat( ppb );
			}
			return true;
		}
		return false;
	}
	setFontSize( px ) {
		const fs = Math.min( Math.max( 8, px ), 64 );

		if ( fs !== this.__fontSize ) {
			const isSmall = fs <= 44;

			this.__fontSize = fs;
			this.__sideContent.style.fontSize =
			this.__rowsContainer.style.fontSize = `${ fs }px`;
			Array.from( this.__rows ).forEach( el => el.classList.toggle( "gsui-row-small", isSmall ) );
			return true;
		}
		return false;
	}
	getDuration() {
		const bPM = this.timeline._beatsPerMeasure,
			dur = Object.values( this._opts.getData() )
				.reduce( ( dur, blc ) => Math.max( dur, blc.when + blc.duration ), 0 );

		return Math.max( 1, Math.ceil( dur / bPM ) ) * bPM;
	}
	getBlocks() {
		return this.__blcs;
	}

	// Private small getters
	// ............................................................................................
	__getRow0BCR() { return this.__rows[ 0 ].getBoundingClientRect(); }
	__getRowByIndex( ind ) { return this.__rows[ ind ]; }
	__getRowIndexByRow( row ) { return Array.prototype.indexOf.call( this.__rows, row ); }
	__getRowIndexByPageY( pageY ) {
		const ind = Math.floor( ( pageY - this.__getRow0BCR().top ) / this.__fontSize );

		return Math.max( 0, Math.min( ind, this.__rows.length - 1 ) );
	}
	__getWhenByPageX( pageX ) {
		return Math.max( 0, ( pageX - this.__getRow0BCR().left ) / this.__pxPerBeat );
	}
	__roundBeat( beat ) {
		return Math.max( 0, this.timeline.beatFloor( beat ) );
	}

	// Private util methods
	// ............................................................................................
	__resized() {
		this.__gridPanelResized();
	}
	__attached() {
		const elRows = this.__rowsContainer;

		this.__sideContent.style.right =
		this.__sideContent.style.bottom =
		elRows.style.right =
		elRows.style.bottom = `${ elRows.clientWidth - elRows.offsetWidth }px`;
		this.__uiPanels.attached();
		this.__gridPanelResized();
	}
	__loop( isLoop, a, b ) {
		this.__elLoopA.classList.toggle( "gsuiBlocksManager-loopOn", isLoop );
		this.__elLoopB.classList.toggle( "gsuiBlocksManager-loopOn", isLoop );
		if ( isLoop ) {
			this.__elLoopA.style.width = `${ a }em`;
			this.__elLoopB.style.left = `${ b }em`;
		}
		this._opts.oninputLoop( isLoop && a, b );
	}
	__currentTime( t ) {
		this.__elCurrentTime.style.left = `${ t }em`;
		this._opts.oninputCurrentTime( t );
	}
	__isBlc( el ) {
		return el.classList.contains( "gsuiBlocksManager-block" );
	}
	__getBlc( el ) {
		if ( this.__isBlc( el ) ) {
			return el;
		} else if ( this.__isBlc( el.parentNode ) ) {
			return el.parentNode;
		} else if ( this.__isBlc( el.parentNode.parentNode ) ) {
			return el.parentNode.parentNode;
		}
	}
	__fillBlcsMap( blc ) {
		const blcs = this.__blcsEditing;

		if ( blc.classList.contains( "gsuiBlocksManager-block-selected" ) ) {
			this.__blcsSelected.forEach( ( blc, id ) => blcs.set( id, blc ) );
		} else {
			blcs.set( blc.dataset.id, blc );
		}
		return blcs;
	}
	__unselectBlocks( obj ) {
		const dat = this._opts.getData();

		this.__blcsSelected.forEach( ( blc, id ) => {
			if ( !( id in obj ) ) {
				dat[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
		} );
		return obj;
	}
	__getBeatSnap() {
		return 1 / this.timeline._stepsPerBeat * this.timeline.stepRound;
	}
	__eventReset() {
		this.__mmFn =
		this.__valueA =
		this.__valueB = null;
		this.__valueAMin =
		this.__valueBMin = Infinity;
		this.__valueAMax =
		this.__valueBMax = -Infinity;
		this.__status = "";
		this.__blcsEditing.clear();
	}

	// Events
	// ............................................................................................
	__gridPanelResizing( pan ) {
		const width = pan.clientWidth;

		if ( this.__offset > 0 ) {
			this.__offset -= ( width - this.__elPanGridWidth ) / this.__pxPerBeat;
			this.__rowsContainer.scrollLeft -= width - this.__elPanGridWidth;
		}
		this.__gridPanelResized();
	}
	__gridPanelResized() {
		this.__elPanGridWidth = this.__elPanGrid.clientWidth;
		this.timeline.resized();
		this.timeline.offset( this.__offset, this.__pxPerBeat );
	}
	__onscrollPanelContent() {
		if ( this.__sideContent.scrollTop !== this.__rowsScrollTop ) {
			this.__rowsScrollTop =
			this.__rowsContainer.scrollTop = this.__sideContent.scrollTop;
		}
	}
	__onwheelPanelContent( e ) {
		if ( e.ctrlKey ) {
			const layerY = e.pageY - this.__sideContent.firstElementChild.getBoundingClientRect().top,
				oldFs = this.__fontSize;

			this.setFontSize( oldFs * ( e.deltaY > 0 ? .9 : 1.1 ) );
			this.__rowsScrollTop =
			this.__sideContent.scrollTop =
			this.__rowsContainer.scrollTop += layerY / oldFs * ( this.__fontSize - oldFs );
		}
	}
	__onscrollRows( e ) {
		const elRows = this.__rowsContainer;

		this.__mousemove( e );
		if ( elRows.scrollTop !== this.__rowsScrollTop ) {
			this.__rowsScrollTop =
			this.__sideContent.scrollTop = elRows.scrollTop;
		}
		if ( elRows.scrollLeft !== this.__rowsScrollLeft ) {
			const off = elRows.scrollLeft / this.__pxPerBeat;

			this.__offset = off;
			this.__rowsScrollLeft = elRows.scrollLeft;
			this.timeline.offset( off, this.__pxPerBeat );
		}
		this._opts.onscrollRows();
	}
	__onwheelRows( e ) {
		if ( e.ctrlKey ) {
			const elRows = this.__rowsContainer,
				layerX = e.pageX - elRows.getBoundingClientRect().left + elRows.scrollLeft,
				ppb = Math.round( Math.min( Math.max( 8, this.__pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 ) ), 512 ) );

			this.__rowsScrollLeft =
			elRows.scrollLeft += layerX / this.__pxPerBeat * ( ppb - this.__pxPerBeat );
			this.__offset = elRows.scrollLeft / ppb;
			this.setPxPerBeat( ppb );
		}
	}
	__onclickMagnet() {
		const v = this.timeline.stepRound,
			frac =
				v >= 1 ? 2 :
				v >= .5 ? 4 :
				v >= .25 ? 8 : 1;

		this.timeline.stepRound = 1 / frac;
		this.__magnetValue.textContent = frac <= 1 ? "1" : `1 / ${ frac }`;
		return false;
	}
	__keydown( e ) {
		const dat = this._opts.getData(),
			blcsEditing = this.__blcsEditing;

		switch ( e.key ) {
			case "Delete":
				if ( this.__blcsSelected.size ) {
					this.__blcsSelected.forEach( ( blc, id ) => blcsEditing.set( id, blc ) );
					this.__status = "deleting";
					this.__mouseup();
				}
				break;
			case "b": // copy paste
				if ( e.ctrlKey || e.altKey ) {
					const blcsSel = this.__blcsSelected;

					if ( blcsSel.size ) {
						const data = this._opts.getData();
						let whenMin = Infinity,
							whenMax = 0;

						blcsEditing.clear();
						blcsSel.forEach( ( blc, id ) => {
							const dat = data[ id ];

							whenMin = Math.min( whenMin, dat.when );
							whenMax = Math.max( whenMax, dat.when + dat.duration );
							blcsEditing.set( id, blc );
						} );
						whenMax = this.timeline.beatCeil( whenMax ) - whenMin;
						this._opts.managercallDuplicating( blcsEditing, whenMax );
						blcsEditing.clear();
					}
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			case "a": // select all
			case "d": // deselect
				if ( e.ctrlKey || e.altKey ) {
					const adding = e.key === "a",
						blcs = adding ? this.__blcs : this.__blcsSelected;

					if ( blcs.size ) {
						let notEmpty;

						blcsEditing.clear();
						blcs.forEach( ( blc, id ) => {
							if ( !adding || !dat[ id ].selected ) {
								notEmpty = true;
								blcsEditing.set( id, blc );
							}
						} );
						if ( notEmpty ) {
							this.__status = "selecting-1";
							this.__mouseup();
						}
					}
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
}

document.addEventListener( "mousemove", e => {
	if ( gsuiBlocksManager._focused ) {
		gsuiBlocksManager._focused.__mousemove( e );
	}
} );
document.addEventListener( "mouseup", e => {
	if ( gsuiBlocksManager._focused ) {
		if ( gsuiBlocksManager._focused._opts.mouseup ) {
			gsuiBlocksManager._focused._opts.mouseup( e );
		}
		gsuiBlocksManager._focused.__mouseup( e );
	}
} );
