/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/nttdata/covercraft/r126pdfview/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});