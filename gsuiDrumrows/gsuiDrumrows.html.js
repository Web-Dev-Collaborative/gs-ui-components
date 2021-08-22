"use strict";

GSUI.setTemplate( "gsui-drumrows", () => [
	GSUI.createElement( "div", { class: "gsuiDrumrows-drop" },
		GSUI.createElement( "div", { class: "gsuiDrumrows-dropIn" },
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
		),
	),
] );

GSUI.setTemplate( "gsui-drumrow", () => (
	GSUI.createElement( "form", { class: "gsuiDrumrow", draggable: "true" },
		GSUI.createElement( "div", { class: "gsuiDrumrow-grip" },
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "grip-v" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDrumrow-main" },
			GSUI.createElement( "button", { type: "button", class: "gsuiIcon gsuiDrumrow-btnToggle", "data-action": "toggle", "data-icon": "toggle", title: "Toggle the drumrow (right click for solo)" } ),
			GSUI.createElement( "button", { type: "button", class: "gsuiIcon gsuiDrumrow-btnProps", "data-action": "props", "data-icon": "drumprops", title: "Expand props panel" } ),
			GSUI.createElement( "button", { type: "button", class: "gsuiIcon gsuiDrumrow-btnDelete", "data-action": "delete", "data-icon": "close", title: "Remove the drumrow" } ),
			GSUI.createElement( "span", { class: "gsuiDrumrow-name" } ),
			GSUI.createElement( "div", { class: "gsuiDrumrow-waveWrap" } ),
			GSUI.createElement( "div", { class: "gsuiDrumrow-detune", title: "pitch" },
				GSUI.createElement( "gsui-slider", { type: "linear-y", min: -12, max: 12, step: 1, "mousemove-size": 400, "data-prop": "detune" } ),
			),
			GSUI.createElement( "div", { class: "gsuiDrumrow-pan", title: "pan" },
				GSUI.createElement( "gsui-slider", { type: "linear-y", min: -1, max: 1, step: .02, "mousemove-size": 400, "data-prop": "pan" } ),
			),
			GSUI.createElement( "div", { class: "gsuiDrumrow-gain", title: "gain" },
				GSUI.createElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDrumrow-props" },
			GSUI.createElement( "label", { class: "gsuiDrumrow-prop gsuiDrumrow-propDetune", tabindex: 0 },
				GSUI.createElement( "input", { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "detune" }, "pitch" ),
				GSUI.createElement( "span", { class: "gsuiDrumrow-propSpan" }, "pitch" ),
			),
			GSUI.createElement( "label", { class: "gsuiDrumrow-prop gsuiDrumrow-propPan", tabindex: 0 },
				GSUI.createElement( "input", { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "pan" }, "pan" ),
				GSUI.createElement( "span", { class: "gsuiDrumrow-propSpan" }, "pan" ),
			),
			GSUI.createElement( "label", { class: "gsuiDrumrow-prop gsuiDrumrow-propGain", tabindex: 0 },
				GSUI.createElement( "input", { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "gain" }, "gain" ),
				GSUI.createElement( "span", { class: "gsuiDrumrow-propSpan" }, "gain" ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDrumrows-drop" },
			GSUI.createElement( "div", { class: "gsuiDrumrows-dropIn" },
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			),
		),
	)
) );
