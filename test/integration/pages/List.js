sap.ui.define(["sap/ui/test/Opa5","sg/report/zprice/test/integration/pages/Common","sap/ui/test/actions/Press"],function(e,t,s){"use strict";var i="List";e.createPageObjects({onTheAppPage:{baseClass:t,actions:{iDoMyAction:function(){return this.waitFor({id:"idAppControl",viewName:i,actions:[function(){}],errorMessage:"implement test"})}},assertions:{iShouldSeeTheApp:function(){return this.waitFor({id:"idAppControl",viewName:i,success:function(){e.assert.ok(true,"The List view is displayed")},errorMessage:"Did not find the List view"})},iDoMyAssertion:function(){return this.waitFor({id:"idAppControl",viewName:i,success:function(){e.assert.ok(false,"Implement test")},errorMessage:"implement me"})}}}})});