sap.ui.define(
  [
    "reportesobjetivos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "reportesobjetivos/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("reportesobjetivos.controller.SubCategories.reportSubCategories", {
      formatter: formatter,
      onInit: function () {
        this.createDynamicGridTable();
      },
      prepareOData: function () {
        const oModelOData = this.getOwnerComponent().getModel("report");
        const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        const oModelo = new JSONModel();
        const oCount = new JSONModel({ count: 0, update: "" });

        const iProveedor = this.byId("proveedor");
        const iGrupo = this.byId("grupo");
        const tProvGrupo = this.byId("provgrupo");
        const bRefresh = this.byId("refresh");

        let currentDateTime = new Date();
        let formattedDate = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "HH:mm:ss" }).format(currentDateTime);

        if (!this._busyDialogLoad) {
          this._busyDialogLoad = new sap.m.BusyDialog({
            text: oResourceBundle.getText("loadingData"),
            showCancelButton: false,
          });
        }
        this._busyDialogLoad.open();

        var oDataFilter = new Array();

        if (iProveedor.getValue()) {
          oDataFilter.push(new Filter("Proveedor", FilterOperator.EQ, iProveedor.getValue()));
        }

        if (iGrupo.getValue()) {
          oDataFilter.push(new Filter("Comprador", FilterOperator.EQ, iGrupo.getValue()));
        }

        tProvGrupo.setText(iProveedor.getValue() + "  " + iGrupo.getValue());

        let queryFilter = new Array(new Filter({ filters: oDataFilter, and: true }));

        oModelOData.read("/objetivosSet", {
          filters: queryFilter,
          urlParameters: {
            $expand: "objetivosComp",
          },
          success: (aData) => {
            console.log("aca", aData);
            aData.results.forEach((item, idx) => {
              for (let month in item.objetivosComp.results) {
                const previousMonthData = item.objetivosComp.results[month - 1];

                item.objetivosComp.results[month].objBalanceWithout = item.objetivosComp.results[month]
                  ? item.objetivosComp.results[month].SaldoAnterior * (1 + item.objetivosComp.results[month].Incremento / 100)
                  : 0;

                item.objetivosComp.results[month].Incremento = item.objetivosComp.results[month].Incremento ? item.objetivosComp.results[month].Incremento : 0;

                item.objetivosComp.results[month].objBalanceWith =
                  previousMonthData && previousMonthData.objetive && previousMonthData.objetive < 0
                    ? item.objetivosComp.results[month].objBalanceWithout + Math.abs(previousMonthData.objetive)
                    : item.objetivosComp.results[month].objBalanceWithout;

                item.objetivosComp.results[month].objetive = (
                  item.objetivosComp.results[month].SaldoActual - item.objetivosComp.results[month].objBalanceWith
                ).toFixed(2);
              }
            });
            oModelo.setData(aData);
            oCount.setData({ count: aData.results.length, update: formattedDate });
            bRefresh.setEnabled(true);
            this.getView().setModel(oModelo);
            this.byId('gridTable').setShowOverlay(false)
            this._busyDialogLoad.close();
          },
          error: (error) => {
            console.log(error);
          },
        });
        this.getView().setModel(oCount, "oCount");
      },
      createDynamicGridTable: function () {
        var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        const oModel = this.getView().getModel();
        var oTableG = this.getView().byId("gridTable");
        oTableG.setModel(oModel);

        const currentDateTime = new Date();
        const month = currentDateTime.getMonth().toString();

        console.log(month);

        oTableG.addColumn(
          new sap.ui.table.Column({
            label: new sap.m.Label({ text: "SubCategoria" }),
            autoResizable: true,
            template: new sap.m.VBox({
              items: [new sap.m.Text({ text: "{Descripcion}" }), new sap.m.Text({ text: "{Subcategoria}" })],
            }).addStyleClass("textCenter"),
          })
        );

        oTableG.addColumn(
          new sap.ui.table.Column({
            label: new sap.m.Label({ text: "" }),
            width: "200px",
            template: new sap.m.VBox({
              items: [
                new sap.m.Text({ text: oResourceBundle.getText("salesMonthYear") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("Incremento") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWithout") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWith") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("realSale") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: "Bultos" }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("statusState") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("deliveryProgress") }),
              ],
            }).addStyleClass("sapUiSmallMarginTopBottom"),
          })
        );

        for (var i = 0; i <= month; i++) {
          var monthDescriptions = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
          oTableG.addColumn(
            new sap.ui.table.Column({
              label: new sap.m.Label({ text: monthDescriptions[i] }),
              width: "180px",
              template: new sap.m.VBox({
                items: [
                  new sap.m.Text({ text: "$ {objetivosComp/results/" + i + "/SaldoAnterior}" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "{objetivosComp/results/" + i + "/Incremento} %" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "$ {objetivosComp/results/" + i + "/objBalanceWithout}" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "$ {objetivosComp/results/" + i + "/objBalanceWith}" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "$ {objetivosComp/results/" + i + "/SaldoActual}" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "{objetivosComp/results/" + i + "/Bultos} Bto" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.ObjectStatus({
                    text: "$ {objetivosComp/results/" + i + "/objetive}",
                    state: {
                      parts: [{ path: "objetivosComp/results/" + i + "/objetive" }],
                      formatter: formatter.objetive,
                    },
                  }).addStyleClass("sapUiTinyMarginBottom"),

                  new sap.m.ProgressIndicator({
                    width: "90%",
                    percentValue: "{= ${objetivosComp/results/" + i + "/SaldoActual} / ${objetivosComp/results/" + i + "/objBalanceWith} * 100}",
                    displayValue: {
                      parts: [{ path: "objetivosComp/results/" + i + "/SaldoActual" }, { path: "objetivosComp/results/" + i + "/objBalanceWith" }],
                      formatter: formatter.formatPercentage,
                    },
                    state: {
                      parts: [{ path: "objetivosComp/results/" + i + "/SaldoActual" }, { path: "objetivosComp/results/" + i + "/objBalanceWith" }],
                      formatter: formatter.progress,
                    },
                    showValue: false,
                  }).addStyleClass("progressIndicator"),
                ],
              }).addStyleClass("sapUiSmallMarginTopBottom textCenter"),
            })
          );
        }

        oTableG.bindRows("/results");
      },
      onSubcategorySelectionChange: function (oEvent) {
        var oMultiComboBox = this.getView().byId("subcategoryFilter");
        var aSelectedItems = oMultiComboBox.getSelectedItems();
        var aSelectedSubcategories = aSelectedItems.map(function (oItem) {
          return oItem.getKey();
        });

        var oTable = this.getView().byId("gridTable");
        var oBinding = oTable.getBinding("rows");

        var aFilters = [];

        if (aSelectedSubcategories.length > 0) {
          aSelectedSubcategories.forEach(function (sSubcategory) {
            var oFilter = new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.EQ, sSubcategory);
            aFilters.push(oFilter);
          });
          var oCombinedFilter = new sap.ui.model.Filter(aFilters, false);
          oBinding.filter(oCombinedFilter);
        } else {
          oBinding.filter([]);
        }
      },
      clearAllFilters: function () {
        var oMultiComboBox = this.byId("subcategoryFilter"),
          oComboProveedor = this.byId("proveedor"),
          oComboGrupo = this.byId("grupo");

        oMultiComboBox.removeAllSelectedItems();
        oComboProveedor.setValue("");
        oComboGrupo.setValue("");

        this.onSubcategorySelectionChange();
      },
      onSelectionChange: function(){
        this.byId('gridTable').setShowOverlay(true)
      }
    });
  }
);
