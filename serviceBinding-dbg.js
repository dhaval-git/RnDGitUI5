function initModel() {
	var sUrl = "/OData_Provisioning/sap/opu/odata/sap/ZPRICE_REPORT_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}