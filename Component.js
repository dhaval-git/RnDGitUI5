sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","sg/report/zprice/model/models"],function(e,t,i){"use strict";return e.extend("sg.report.zprice.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(i.createDeviceModel(),"device")}})});