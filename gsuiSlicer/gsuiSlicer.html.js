"use strict";

GSUI.setTemplate( "gsui-slicer", () => ( [
	GSUI.createElement( "div", { class: "gsuiSlicer-source" },
		GSUI.createElement( "span", { class: "gsuiSlicer-source-name" }, "my-sample.mp3" ),
		GSUI.createElement( "div", { class: "gsuiSlicer-source-sample" },
			GSUI.createElement( "div", { class: "gsuiSlicer-source-wave" } ),
			GSUI.createElement( "div", { class: "gsuiSlicer-source-cropA" } ),
			GSUI.createElement( "div", { class: "gsuiSlicer-source-cropB" } ),
		),
	),
	GSUI.createElement( "div", { class: "gsuiSlicer-cropArrows" } ),
	GSUI.createElement( "div", { class: "gsuiSlicer-preview" } ),
	GSUI.createElement( "div", { class: "gsuiSlicer-slices" },
		GSUI.createElement( "gsui-beatlines" ),
		GSUI.createElement( "div", { class: "gsuiSlicer-slicesWrap" } ),
	),
	GSUI.createElement( "div", { class: "gsuiSlicer-duration" },
		GSUI.createElement( "input", { class: "gsuiSlicer-duration-input", type: "number", min: 1, max: 99, step: 1, value: 4 } ),
		GSUI.createElement( "span", { class: "gsuiSlicer-duration-label" }, "beats" ),
	),
] ) );