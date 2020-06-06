sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter,
	FilterOperator, ODataModel) {
	"use strict";

	//Global Variable
	var selectedItems, that, msg, salesOrg, distChannel, shipTo, soldTo, date, uri;

	uri = "/OData_Provisioning/sap/opu/odata/sap/ZPRICE_REPORT_SRV";

	return Controller.extend("sg.report.zprice.controller.List", {

		onInit: function () {
			that = this;
			that.getDistChannel();
		},

		//Load add on click of Dist. Channel Drop Down
		getDistChannel: function (oEvent) {

			salesOrg = this.getView().byId("idSalesOrg").getValue();

			var distChannelFilter = [];

			if (salesOrg) {
				distChannelFilter.push(new sap.ui.model.Filter("SalesOrg", FilterOperator.EQ, salesOrg));
			}

			var oDistChannel = new sap.m.ComboBox("idDistChannel");

			var oTemplateDistChannel = new sap.ui.core.Item({
				cells: [new sap.m.Text({
					key: "{DistChannel}",
					text: "{DistChannel}"
				})]
			});

			//Binding data using filter for Material Drop-Down
			oDistChannel.bindAggregation("items", {
				path: "/DistChannelF4Set",
				template: oTemplateDistChannel,
				filters: distChannelFilter
			});

		},

		oSoldPopup: null,

		handleSoldTo: function (oEvent) {

			if (!that.oSoldPopup) {

				//Local Variable 
				var soldOdata;
				var soldToFilters = [];
				var oDataModelSoldTo = new ODataModel(uri, true);

				//Creating Fragment object 
				that.oSoldPopup = new sap.ui.xmlfragment("sg.report.zprice.fragments.dialog", that);

				//Getting values passed in fields
				salesOrg = this.getView().byId("idSalesOrg").getValue();
				distChannel = this.getView().byId("idDistChannel").getValue();

				//Passing field values to Filter object.
				soldToFilters.push(new sap.ui.model.Filter("SalesOrg", FilterOperator.EQ, salesOrg));
				soldToFilters.push(new sap.ui.model.Filter("DistChannel", FilterOperator.EQ, distChannel));

				oDataModelSoldTo.read("/SoldToF4Set", {
					filters: soldToFilters,
					success: function (oSuccess) {
						soldOdata = oSuccess; //OData passed

						//Setting properties to SelectDialog
						that.oSoldPopup.setTitle("Sold To");
						that.oSoldPopup.setContentWidth("250px");
						that.oSoldPopup.attachConfirm(that.SoldToSelectionFinish, that);
						that.oSoldPopup.attachLiveChange(that.SoldToSearch, that);
						that.oSoldPopup.attachCancel(that.SoldToSelectionCancel, that);

						that.oSoldPopup.addStyleClass("sapUiSizeCompact");

						// that.oSoldPopup = new sap.m.SelectDialog({
						// 	title: "Sold To",
						// 	contentWidth: "250px",
						// 	liveChange: [that.SoldToSearch, that],
						// 	confirm: [that.SoldToSelectionFinish, that]
						// }).addStyleClass("sapUiSizeCompact");

						that.getView().addDependent(that.oSoldPopup);

						var jsonModelTrigger = new JSONModel(soldOdata);
						that.oSoldPopup.setModel(jsonModelTrigger);

						that.oSoldPopup.bindAggregation("items", {
							path: "/results",
							template: new sap.m.StandardListItem({
								title: "{Customer}",
								description: "{Name1}"
							})
						});

						that.oSoldPopup.open();

					},
					error: function (oError) {
						MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error Message",
							actions: [MessageBox.Action.OK]
						});
					}

				});

			}

		},

		//LiveChange for SoldTo SelectDialog
		SoldToSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue !== null) {
				var oFilter1 = new sap.ui.model.Filter("Customer",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter1);
				var oFilter2 = new sap.ui.model.Filter("Name1",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter2);
				var fFilters = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oEvent.getSource().getBinding("items").filter(
					[fFilters]);
			}

		},

		//Confirm for SoldTo SelectDialog
		SoldToSelectionFinish: function (oEvent) {

			var selectedItem = oEvent.getParameter("selectedItem").getTitle();

			that.getView().byId("idSoldTo").setValue(selectedItem);

			//Clearing values of liveChange in Dialog.fragment
			oEvent.getSource().getBinding("items").filter([]);

			that.oSoldPopup = undefined;

		},

		//Cancel for SoldTo SelectDialog
		SoldToSelectionCancel: function () {
			that.oSoldPopup = undefined;
		},

		//Load data in Ship To Dailog
		oShipPupup: null,
		handleShipTo: function (oEvent) {

			var shipOdata;
			if (!this.oShipPopup) {
				var shipToFilters = [];
				var oDataModelShipTo = new sap.ui.model.odata.ODataModel(uri, true);

				salesOrg = this.getView().byId("idSalesOrg").getValue();
				distChannel = this.getView().byId("idDistChannel").getValue();
				shipTo = this.getView().byId("idSoldTo").getValue();

				if (shipTo === "") {
					msg = "Enter Sold To";
					//MessageBox.error(msg);
					MessageToast.show(msg);
					return;
				}

				shipToFilters.push(new sap.ui.model.Filter("SalesOrg", FilterOperator.EQ, salesOrg));
				shipToFilters.push(new sap.ui.model.Filter("DistChannel", FilterOperator.EQ, distChannel));
				shipToFilters.push(new sap.ui.model.Filter("Customer", FilterOperator.EQ, shipTo));

				var oItemTemplateE = new sap.m.StandardListItem({
					title: "{Customer}",
					description: "{Name1}"
				});

				oDataModelShipTo.read("/ShipToF4Set", {
					filters: shipToFilters,
					success: function (oSuccess) {
						shipOdata = oSuccess;

						that._valueHelpDialogShipTo = new sap.m.SelectDialog({
							title: "Ship To",
							contentWidth: "250px",
							liveChange: [that._valueHelpShipToSearch, that],
							confirm: [that.handleSelectionFinishShipTo, that]
						}).addStyleClass("sapUiSizeCompact");

						var jsonModelTrigger = new JSONModel(shipOdata);
						that._valueHelpDialogShipTo.setModel(jsonModelTrigger);
						that._valueHelpDialogShipTo.bindAggregation("items", "/results", oItemTemplateE);

						that._valueHelpDialogShipTo.open();
					},
					error: function (oError) {
						MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error Message",
							actions: [MessageBox.Action.OK]
						});
					}
				});
			}
		},

		/********** Start of Material Field Changes **********/

		/*Code done by Amit Mahindre*/
		/*Start of Code*/
		handleMaterial: function (oEvent) {
			var materialOdata;
			var oDataModelMat = new ODataModel(uri, true);
			salesOrg = this.getView().byId("idSalesOrg").getValue();
			distChannel = this.getView().byId("idDistChannel").getValue();
			var materialFilters = [];
			if (salesOrg) {
				materialFilters.push(new sap.ui.model.Filter("SalesOrg", FilterOperator.EQ, salesOrg));
			}
			if (distChannel) {
				materialFilters.push(new sap.ui.model.Filter("DistChannel", FilterOperator.EQ, distChannel));
			} else {
				msg = "Enter Dist. Channel";
				MessageToast.show(msg);
				return;
			}

			var oItemTemplateE = new sap.m.StandardListItem({
				title: "{MaterialCode}",
				description: "{MaterialDesc}"
			});

			oDataModelMat.read("/MaterialF4Set", {
				filters: materialFilters,
				success: function (oSuccess) {
					materialOdata = oSuccess;
					var token_input_arr1 = [];
					var token_input = that.getView().byId("idMaterial");
					var tokens = token_input.getTokens();
					for (var i = 0; i < tokens.length; i++) {
						var t_name = tokens[i].getText();
						var t_key = tokens[i].getKey();
						token_input_arr1.push({
							MaterialCode: t_key,
							MaterialDesc: t_name
						});
					}

					var sarray = [],
						uarray = [],
						main_array = [];

					for (var j = 0; j < materialOdata.results.length; j++) {
						var flag = 0;
						for (var i = 0; i < token_input_arr1.length; i++) {

							if (token_input_arr1[i].MaterialCode == materialOdata.results[j].Material)
								flag = 1;
						}

						if (flag == 1) {
							var selarr = {
								MaterialCode: materialOdata.results[j].Material,
								MaterialDesc: materialOdata.results[j].Description
							};
							sarray.push(selarr);
						} else {
							var unselarr = {
								MaterialCode: materialOdata.results[j].Material,
								MaterialDesc: materialOdata.results[j].Description
							};
							uarray.push(unselarr);
						}
					}
					main_array = sarray.concat(uarray);
					var jsonModelTrigger = new JSONModel();
					jsonModelTrigger.setData(main_array);

					that._valueHelpDialog = new sap.m.SelectDialog({
						styleClass: "sapUiSizeCompact",
						title: "Material",
						contentWidth: "250px",
						growingScrollToLoad: true,
						multiSelect: true,
						customData: [
							new sap.ui.core.CustomData({
								key: "{MaterialCode}",
								value: "{MaterialDesc}"
							})
						],
						liveChange: [that._valueHelpMaterialSearch, that],
						confirm: [that.handleSelectionFinish, that]
					}).addStyleClass("sapUiSizeCompact");
					that._valueHelpDialog.setModel(jsonModelTrigger);
					that._valueHelpDialog.bindAggregation("items", "/", oItemTemplateE);

					that._valueHelpDialog._oList.attachEventOnce("updateFinished", function (oEvent) {
						token_input.removeAllTokens();
						for (var i = 0; i < token_input_arr1.length; i++) {
							var token_key = token_input_arr1[i].MaterialCode;
							var token_text = token_input_arr1[i].MaterialDesc;
							var oList = that._valueHelpDialog._list;
							token_input.addToken(new sap.m.Token({
								key: token_key,
								text: token_text
							}));
							for (var j = 0; j < oList.getItems().length; j++) {
								var list_text = oList.getItems()[j].getTitle();
								var list_key = oList.getItems()[j].getDescription();
								if (token_key === list_key)
									oList.getItems()[j].setSelected(true);
							}
						}
					});
					that._valueHelpDialog.open();
				},
				error: function (oError) {
					MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
						icon: MessageBox.Icon.ERROR,
						title: "Error Message",
						actions: [MessageBox.Action.OK]
					});
				}
			});
		},
		/*End  of Code*/
		/*Code done by Amit Mahindre*/

		_valueHelpMaterialSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue !== null) {
				var oFilter1 = new sap.ui.model.Filter("MaterialCode",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter1);
				var oFilter2 = new sap.ui.model.Filter("MaterialDesc",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter2);
				var fFilters = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oEvent.getSource().getBinding("items").filter(
					[fFilters]);
			}
		},

		//Event 'confirm' for SelectDialog - Material
		handleSelectionFinish: function (oEvent) {

			var list_seld_item1 = [];
			var input_token1 = that.getView().byId("idMaterial");
			input_token1.removeAllTokens();
			var oList = oEvent.getParameters("selectedItems").selectedItems;
			for (var i = 0; i < oList.length; i++) {
				var title = oList[i].getTitle();
				var key = oList[i].getDescription();
				input_token1.addToken(new sap.m.Token({
					key: key,
					text: title
				}));
				list_seld_item1.push(title);
			}

			//Clearing values of liveChange in Dialog.fragment
			oEvent.getSource().getBinding("items").filter([]);

		},
		/********** End of Material Field Changes **********/

		/********** Start of Sold-To Field Changes **********/
		//Filtering values on Pop-up for Sold-To-Party
		_valueHelpSoldToSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue !== null) {
				var oFilter1 = new sap.ui.model.Filter("Customer",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter1);
				var oFilter2 = new sap.ui.model.Filter("Name1",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter2);
				var fFilters = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oEvent.getSource().getBinding("items").filter(
					[fFilters]);
			}
		},

		//Event 'confirm' for SelectDialog - Sold-To-Party
		handleSelectionFinishSoldTo: function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem").getTitle();

			that.getView().byId("idSoldTo").setValue(selectedItem);

			//Clearing values of liveChange in Dialog.fragment
			oEvent.getSource().getBinding("items").filter([]);

		},
		/********** End of Sold-To Field Changes **********/

		/********** Start of Ship-To Field Changes **********/
		//Filtering values on Pop-up for Sold-To-Party
		_valueHelpShipToSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue !== null) {
				var oFilter1 = new sap.ui.model.Filter("Customer",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter1);
				var oFilter2 = new sap.ui.model.Filter("Name1",
					FilterOperator.Contains,
					sValue);
				aFilters.push(oFilter2);
				var fFilters = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oEvent.getSource().getBinding("items").filter(
					[fFilters]);
			}
		},

		//Event 'confirm' for SelectDialog - Ship-To-Party
		handleSelectionFinishShipTo: function (oEvent) {

			var selectedItem = oEvent.getParameter("selectedItem").getTitle();

			that.getView().byId("idShipTo").setValue(selectedItem);

			//Clearing values of liveChange in Dialog.fragment
			oEvent.getSource().getBinding("items").filter([]);

		},
		/********** End of Ship-To Field Changes **********/

		/********** Start of Search Button changes **********/
		//Event for Go button pressed
		onSearch: function (oEvent) {

				selectedItems = this.getView().byId("idMaterial").getTokens();

				//Validate values of Material
				if (selectedItems === "" || selectedItems === null) {
					msg = "Material no. is mandatory";
					MessageToast.show(msg);
					return;
				}

				//Validate values of Date
				date = this.getView().byId("idDatePicker").getValue();
				if (date === "") {
					msg = "Date is mandatory";
					//MessageBox.error(msg);
					MessageToast.show(msg);
					return;
				}

				//Validate values of Sales Org.
				salesOrg = this.getView().byId("idSalesOrg").getValue();
				if (salesOrg === "") {
					msg = "Sales Org. is mandatory";
					MessageToast.show(msg);
					return;
				}

				//Validate values of Distrubution Channel
				distChannel = this.getView().byId("idDistChannel").getValue();
				if (distChannel === "") {
					msg = "Distrubution Channel is mandatory";
					MessageToast.show(msg);
					return;
				}

				//Validate values of Sold To Party
				soldTo = this.getView().byId("idSoldTo").getValue();
				if (soldTo === "") {
					msg = "Sold-To-Party is mandatory";
					MessageToast.show(msg);
					return;
				}

				//Get values of Ship To Party
				shipTo = this.getView().byId("idShipTo").getValue();

				//Add filter values 
				var listFilters = [];

				if (distChannel) {
					listFilters.push(new sap.ui.model.Filter("DistChannel", FilterOperator.EQ, distChannel));
				}
				if (shipTo) {
					listFilters.push(new sap.ui.model.Filter("ShipTo", FilterOperator.EQ, shipTo));
				}
				if (soldTo) {
					listFilters.push(new sap.ui.model.Filter("SoldTo", FilterOperator.EQ, soldTo));
				}
				if (date) {
					listFilters.push(new sap.ui.model.Filter("Date", FilterOperator.EQ, date));
				}
				if (selectedItems) {
					for (var i = 0; i < selectedItems.length; i++) {
						listFilters.push(new sap.ui.model.Filter("Material", FilterOperator.EQ, selectedItems[i].getText()));
					}
				}

				//Created template for table
				var oTemplate = new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
						text: "{Material}"
					}), new sap.m.Text({
						text: "{CodeType}"
					}), new sap.m.Text({
						text: "{CustomerOrBranch}"
					}), new sap.m.Text({
						text: "{Price}"
					}), new sap.m.Text({
						text: "{Unit}"
					})]
				});

				//Output Table
				var oTable = this.getView().byId("tblOutput");

				//Clearing values of table.
				oTable.destroyItems();

				var oModelOutput = new ODataModel(uri, true);

				oModelOutput.read("/OutputListSet", {
					context: {},
					urlParamters: {},
					async: true,
					filters: listFilters,
					sorters: [],
					success: function (oSuccess) {
						oTable.bindItems("/OutputListSet", oTemplate, null, listFilters);
					},
					error: function (oError) {
						MessageBox.show(JSON.parse(oError.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error Message",
							actions: [MessageBox.Action.OK]
						});
					}
				});

			}
			/********** End of Search Button changes **********/

	});
});