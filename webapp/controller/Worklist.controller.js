sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/type/String",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/table/Column",
	"sap/m/Column",
    "sap/m/SearchField",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter,typeString, Filter, FilterOperator,UIColumn, MColumn,SearchField,Fragment) {
    "use strict";

    return BaseController.extend("com.nttdata.covercraft.r126pdfview.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            var oViewModel;
            this._oMultiInput = this.getView().byId("idProdOrd");
            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

            // var obj = {
            //     "Source": "",
            //     "Title": ""
            // };
            // var oModel = new JSONModel(obj);
            // this.getView().setModel(oModel, "pdfModel");
            this._oModel = new JSONModel({
				Source: "",
				Title: "My Custom Title",
				Height: "500px"
			});

            this.oColModel = {
                "cols": [
                    {
                        "label": "DeliveryDocument",
                        "template": "DeliveryDocument",
                        "width": "5rem"
                    },
                    {
                        "label": "DeliveryDocumentType",
                        "template": "DeliveryDocumentType"
                    },
                    {
                        "label": "ShipToParty",
                        "template": "ShipToParty"
                    }
                ]
            }
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack : function() {
            // eslint-disable-next-line fiori-custom/sap-no-history-manipulation, fiori-custom/sap-browser-api-warning
            history.go(-1);
        },


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Value", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/FORMSet".length)
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },
        onDeliveryChange: function(oEvent){
            var Product = oEvent.getSource().getValue();
           debugger;
            var oDataModel = this.getOwnerComponent().getModel();
            var sServiceURL = oDataModel.sServiceUrl;
            var sSource = sServiceURL + "/FORMSet(Delivery='" + Product + "')/$value";
            //  var url = window.location.href+sSource;
            // var url = "https://www.africau.edu/images/default/sample.pdf"
            this._oModel.setProperty("/Source", sSource);
            this.getView().setModel(this._oModel);
            
            // this.getView().byId("pdf").setSource(url);

        },

        // onDeliveryF4: function(oEvt){

        //     var sPath = "/ZC_MM_DELIVERY_VH";
        //     var oSuccess = function (oData) {
		// 		sap.ui.core.BusyIndicator.hide();
		// 		var oModel = new JSONModel();
		// 		oModel.setData(oData.results);
		// 		this.getView().setModel(oModel, "Delivery");
        //           this.onDelivery(oData.results);
		// 	}.bind(this);
		// 	var oError = function (error) {
		// 		sap.ui.core.BusyIndicator.hide();
		// 	}.bind(this);
        //     this.getOwnerComponent().getModel("ZMM_126_MX_PALLET").read(sPath, {
		// 		success: oSuccess,
		// 		error: oError
				
		// 	});
        // },

        // onDeliveryF4: function(oEvt){
        //     this._oBasicSearchField = new sap.m.SearchField();
		// 	if (!this.pDialog) {
		// 		this.pDialog = this.loadFragment({
		// 			name: "com.nttdata.covercraft.r126pdfview.fragments.Delivery"
		// 		});
		// 	}
		// 	this.pDialog.then(function(oDialog) {
		// 		var oFilterBar = oDialog.getFilterBar();
		// 		this._oVHD = oDialog;
		// 		// Initialise the dialog with model only the first time. Then only open it
		// 		if (this._bDialogInitialized) {
		// 			// Re-set the tokens from the input and update the table
		// 			oDialog.setTokens([]);
		// 			oDialog.setTokens(this.getView().byId("Dialog").getTokens());
		// 			oDialog.update();

		// 			oDialog.open();
		// 			return;
		// 		}
		// 		this.getView().addDependent(oDialog);

		// 		// Set key fields for filtering in the Define Conditions Tab
		// 		oDialog.setRangeKeyFields([{
		// 			label: "DeliveryDocument",
		// 			key: "DeliveryDocument",
		// 			type: "string",
		// 			typeInstance: new TypeString({}, {
		// 				maxLength: 7
		// 			})
		// 		}]);

		// 		// Set Basic Search for FilterBar
		// 		oFilterBar.setFilterBarExpanded(false);
		// 		oFilterBar.setBasicSearch(this._oBasicSearchField);

		// 		// Trigger filter bar search when the basic search is fired
		// 		this._oBasicSearchField.attachSearch(function() {
		// 			oFilterBar.search();
		// 		});

		// 		oDialog.getTableAsync().then(function (oTable) {

		// 			oTable.setModel(this.getOwnerComponent().getModel("ZMM_126_MX_PALLET"));

		// 			// For Desktop and tabled the default table is sap.ui.table.Table
		// 			if (oTable.bindRows) {
		// 				// Bind rows to the ODataModel and add columns
		// 				oTable.bindAggregation("rows", {
		// 					path: "/ZC_MM_DELIVERY_VH",
		// 					events: {
		// 						dataReceived: function() {
		// 							oDialog.update();
		// 						}
		// 					}
		// 				});
		// 				oTable.addColumn(new UIColumn({label: "Delivery", template: "DeliveryDocument"}));
		// 				oTable.addColumn(new UIColumn({label: "Delivery Type", template: "DeliveryDocumentType"}));
		// 			}

		// 			// For Mobile the default table is sap.m.Table
		// 			if (oTable.bindItems) {
		// 				// Bind items to the ODataModel and add columns
		// 				oTable.bindAggregation("items", {
		// 					path: "/ZC_MM_DELIVERY_VH",
		// 					template: new ColumnListItem({
		// 						cells: [new Label({text: "{DeliveryDocument}"}), new Label({text: "{DeliveryDocumentType}"})]
		// 					}),
		// 					events: {
		// 						dataReceived: function() {
		// 							oDialog.update();
		// 						}
		// 					}
		// 				});
		// 				oTable.addColumn(new MColumn({header: new Label({text: "Delivery"})}));
		// 				oTable.addColumn(new MColumn({header: new Label({text: "Delivery Type"})}));
		// 			}
		// 			oDialog.update();
		// 		}.bind(this));

		// 		// oDialog.setTokens(this.getView().byId("Dialog").getTokens());
        //         oDialog.open();
		// 	}.bind(this));
        // },


        onDeliveryF4: function() {
            // var oModel = new JSONModel();
			// 	oModel.setData(oData);
			// 	this.getView().setModel(oModel, "Delivery");
			var aCols = this.oColModel;
			this._oBasicSearchField = new SearchField();

			Fragment.load({
				name: "com.nttdata.covercraft.r126pdfview.fragments.Delivery",
				controller: this
			}).then(function name(oFragment) {
				this._oValueHelpDialog = oFragment;
				this.getView().addDependent(this._oValueHelpDialog);

				this._oValueHelpDialog.setRangeKeyFields([{
					label: "DeliveryDocument",
					key: "DeliveryDocument",
					type: "string",
					typeInstance: new typeString({}, {
						maxLength: 7
					})
				}]);

				var oFilterBar = this._oValueHelpDialog.getFilterBar();
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getOwnerComponent().getModel("ZMM_126_MX_PALLET"));
					// oTable.setModel("Delivery");
				 	// oTable.setModel(this.oColModel, "columns");

					// if (oTable.bindRows) {
					// 	oTable.bindAggregation("rows", "/ZC_MM_DELIVERY_VH");
					// }
                    if (oTable.bindRows) {
                        				// Bind rows to the ODataModel and add columns
                        				oTable.bindAggregation("rows", {
                        					path: "/ZC_MM_DELIVERY_VH",
                        					events: {
                        						dataReceived: function() {
                        							// this._oValueHelpDialog.update();
                        						}
                        					}
                        				});
                        				oTable.addColumn(new UIColumn({label: "Delivery", template: "DeliveryDocument"}));
                        				oTable.addColumn(new UIColumn({label: "Delivery Type", template: "DeliveryDocumentType"}));
                                        oTable.addColumn(new UIColumn({label: "Material", template: "Material"}));
                                        oTable.addColumn(new UIColumn({label: "Ship To Party", template: "ShipToParty"}));
                                        oTable.addColumn(new UIColumn({label: "Sold To Party", template: "SoldToParty"}));
                        			}

					if (oTable.bindItems) {
						oTable.bindAggregation("items", "/ZC_MM_DELIVERY_VH", function () {
							return new ColumnListItem({
								cells: aCols.map(function (column) {
									return new Label({ text: "{" + column.template + "}" });
								})
							});
						});
					}

				// 	this._oValueHelpDialog.update();
				}.bind(this));

				//  this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
				this._oValueHelpDialog.open();
			}.bind(this));
		},

        onFilterBarSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({ path: "DeliveryDocument", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "DeliveryDocumentType", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "Material", operator: FilterOperator.Contains, value1: sSearchQuery }),
                    new Filter({ path: "ShipToParty", operator: FilterOperator.Contains, value1: sSearchQuery }),
                    new Filter({ path: "SoldToParty", operator: FilterOperator.Contains, value1: sSearchQuery })
				],

				and: false
			}));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},
       
        _filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		},

        onValueHelpCancelPress: function(oEvt){
            this._oValueHelpDialog.close();
        },

        onValueHelpOkPress: function(oEvent){
            debugger;
            var matTab = oEvent.getSource().getTable();
            var selectedIndex = matTab.getSelectedIndex();
            var selectedConText = matTab.getContextByIndex(selectedIndex).getObject().DeliveryDocument;
            this.getView().byId("idProdOrd").setValue(selectedConText);
            this.sourceBind(selectedConText);
            // var aTokens = oEvent.getParameter("tokens");
			// this._oMultiInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
            // var oSelectedProduct = oEvent.getParameter("selectedItem");
            // var sInputValue = oSelectedProduct.getTitle();
            // this.getView().byId("idProdOrd").setValue(sInputValue);
            
        //     var oDataModel = this.getOwnerComponent().getModel();
        //     var sServiceURL = oDataModel.sServiceUrl;
        //     var sSource = sServiceURL + "/FORMSet(Delivery='" + sInputValue + "')/$value";
        //    this._oModel.setProperty("/Source", sSource);
        //     this.getView().setModel(this._oModel);
        },

       
        sourceBind:function(oEvent){
                 var oDataModel = this.getOwnerComponent().getModel();
            var sServiceURL = oDataModel.sServiceUrl;
            var sSource = sServiceURL + "/FORMSet(Delivery='" + oEvent + "')/$value";
           this._oModel.setProperty("/Source", sSource);
            this.getView().setModel(this._oModel);
        },
       

    });
});
