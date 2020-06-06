/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sg/report/zprice/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"sg/report/zprice/test/integration/pages/List",
	"sg/report/zprice/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sg.report.zprice.view.",
		autoWait: true
	});
});