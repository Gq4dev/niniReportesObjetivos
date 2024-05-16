sap.ui.define(
  [
    "reportesobjetivos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "reportesobjetivos/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
  ],
  function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
    "use strict";

    return BaseController.extend("reportesobjetivos.controller.SubCategories.reportSubCategories", {
      formatter: formatter,
      onInit: function () {
        const oCount = new JSONModel({ count: 0, update: "", proveedores: 0 });
        this.getOwnerComponent().setModel(oCount, "oCount");
        this.getProveedores();
        this.getCompradores();
        this.createDynamicGridTable();
      },
      prepareOData: function () {
        const oModelOData = this.getOwnerComponent().getModel("report");
        const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        const oModelo = new JSONModel();
        const oCount = this.getOwnerComponent().getModel("oCount");

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

        var oDataFilter = [];

        if (iProveedor.getValue()) {
          oDataFilter.push(new Filter("Proveedor", FilterOperator.EQ, iProveedor.getSelectedKey()));
        }

        if (iGrupo.getValue()) {
          oDataFilter.push(new Filter("Comprador", FilterOperator.EQ, iGrupo.getSelectedKey()));
        }

        tProvGrupo.setText(iProveedor.getValue() + "     " + "(" + iGrupo.getValue() + ")");

        oModelOData.read("/objetivosSet", {
          filters: oDataFilter,
          urlParameters: {
            $expand: "objetivosComp",
          },
          success: (aData) => {
            console.log(aData);
            if (aData.results.length === 0) {
              this._busyDialogLoad.close();
              sap.m.MessageToast.show("No hay datos para los filtros seleccionados");
              return;
            }
            aData.results.forEach((item, idx) => {
              for (let month in item.objetivosComp.results) {
                const previousMonthData = item.objetivosComp.results[month - 1];

                console.log(item.objetivosComp.results[month]);
                //Incremento
                item.objetivosComp.results[month].Incremento = item.objetivosComp.results[month].Incremento ? item.objetivosComp.results[month].Incremento : 0;

                //Cantidad mes anterior comparado contra mes ano anterior y mostrar la mayor
                const previousCantidadAnterior = previousMonthData?.CantidadAnterior ?? 0;

                item.objetivosComp.results[month].CantidadAnterior =
                  previousCantidadAnterior < item.objetivosComp.results[month].CantidadAnterior
                    ? item.objetivosComp.results[month].CantidadAnterior
                    : previousCantidadAnterior;

                //Cantidad sin saldo Anterior
                item.objetivosComp.results[month].objBalanceWithout = item.objetivosComp.results[month]
                  ? item.objetivosComp.results[month].CantidadAnterior * (1 + item.objetivosComp.results[month].Incremento / 100)
                  : 0;

                //Cantidad con saldo Anterior
                item.objetivosComp.results[month].objBalanceWith =
                  previousMonthData && previousMonthData.objetive && previousMonthData.objetive < 0
                    ? item.objetivosComp.results[month].objBalanceWithout + Math.abs(previousMonthData.objetive)
                    : item.objetivosComp.results[month].objBalanceWithout;

                //Saldo Objetivo
                item.objetivosComp.results[month].objetive = item.objetivosComp.results[month].CantidadActual
                  ? item.objetivosComp.results[month].CantidadActual - item.objetivosComp.results[month].objBalanceWith
                  : 0;

                //Acumulado Saldo Objetivo
                item.objetivosComp.results[month].objetiveAcc =
                  previousMonthData && previousMonthData.objetiveAcc
                    ? previousMonthData.objetiveAcc + item.objetivosComp.results[month].objetive
                    : item.objetivosComp.results[month].objetive;

                let previousCurrencyAnterior = 0;
                let actualCurrency = 0;

                if (previousMonthData?.SaldoActual && previousMonthData?.CantidadActual) {
                  previousCurrencyAnterior = previousMonthData.SaldoActual / previousMonthData.CantidadActual;
                }

                if (item.objetivosComp.results[month]?.SaldoActual && item.objetivosComp.results[month]?.CantidadActual) {
                  actualCurrency = item.objetivosComp.results[month].SaldoActual / item.objetivosComp.results[month].CantidadActual;
                }

                //objetivo sin saldo Anterior Valorizado
                item.objetivosComp.results[month].objBalanceWithoutVal =
                  previousCurrencyAnterior <= 0
                    ? actualCurrency * item.objetivosComp.results[month].objBalanceWithout
                    : previousCurrencyAnterior * item.objetivosComp.results[month].objBalanceWithout;

                //objetivo con saldo Anterior Valorizado

                item.objetivosComp.results[month].objBalanceWithVal =
                  previousCurrencyAnterior <= 0
                    ? actualCurrency * item.objetivosComp.results[month].objBalanceWith
                    : previousCurrencyAnterior * item.objetivosComp.results[month].objBalanceWith;
              }
            });
            oModelo.setData(aData);
            oCount.setData({ count: aData.results.length, update: formattedDate });
            bRefresh.setEnabled(true);
            this.getView().setModel(oModelo);
            this.byId("gridTable").setShowOverlay(false);
            this._busyDialogLoad.close();
          },
          error: (error) => {
            console.log(error);
          },
        });
        //this.getView().setModel(oCount, "oCount");
      },
      createDynamicGridTable: function () {
        var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        const oModel = this.getView().getModel();
        var oTableG = this.getView().byId("gridTable");
        oTableG.setModel(oModel);

        const currentDateTime = new Date();
        const month = currentDateTime.getMonth().toString();

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
            width: "220px",
            template: new sap.m.VBox({
              items: [
                new sap.m.Text({ text: oResourceBundle.getText("salesMonthYear") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("Incremento") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWithout") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWith") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("realSale") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: "Bultos" }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("statusState") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("statusStateAcc") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("deliveryProgress") }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: "" }).addStyleClass("sapUiTinyMarginBottom"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWithout") + " $" }).addStyleClass("sapUiTinyMarginBottom bold"),
                new sap.m.Text({ text: oResourceBundle.getText("objBalanceWith") + " $" }).addStyleClass("sapUiTinyMarginBottom bold"),
                new sap.m.Text({ text: oResourceBundle.getText("realSale") + " $" }).addStyleClass("sapUiTinyMarginBottom bold"),
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
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/CantidadAnterior", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "{objetivosComp/results/" + i + "/Incremento} %" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/objBalanceWithout", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/objBalanceWith", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/CantidadActual", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.Text({ text: "{objetivosComp/results/" + i + "/Bultos} Bto" }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.ObjectStatus({
                    text: { path: "objetivosComp/results/" + i + "/objetive", formatter: formatter.formatWithThousandsSeparator },
                    state: {
                      parts: [{ path: "objetivosComp/results/" + i + "/objetive" }],
                      formatter: formatter.objetive,
                    },
                  }).addStyleClass("sapUiTinyMarginBottom"),
                  new sap.m.ObjectStatus({
                    text: { path: "objetivosComp/results/" + i + "/objetiveAcc", formatter: formatter.formatWithThousandsSeparator },
                    state: {
                      parts: [{ path: "objetivosComp/results/" + i + "/objetiveAcc" }],
                      formatter: formatter.objetive,
                    },
                  }).addStyleClass("sapUiTinyMarginBottom"),

                  new sap.m.ProgressIndicator({
                    width: "90%",
                    percentValue: "{= ${objetivosComp/results/" + i + "/CantidadActual} / ${objetivosComp/results/" + i + "/objBalanceWith} * 100}",
                    displayValue: {
                      parts: [{ path: "objetivosComp/results/" + i + "/CantidadActual" }, { path: "objetivosComp/results/" + i + "/objBalanceWith" }],
                      formatter: formatter.formatPercentage,
                    },
                    state: {
                      parts: [{ path: "objetivosComp/results/" + i + "/CantidadActual" }, { path: "objetivosComp/results/" + i + "/objBalanceWith" }],
                      formatter: formatter.progress,
                    },
                    showValue: false,
                  })
                    .addStyleClass("progressIndicator")
                    .addStyleClass("sapUiTinyMarginBottom"),

                  new sap.m.Text({ text: "" }).addStyleClass("sapUiTinyMarginBottom "),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/objBalanceWithoutVal", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom bold"),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/objBalanceWithVal", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom bold"),
                  new sap.m.Text({
                    text: { path: "objetivosComp/results/" + i + "/SaldoActual", formatter: formatter.formatWithThousandsSeparator },
                  }).addStyleClass("sapUiTinyMarginBottom bold"),
                ],
              }).addStyleClass("textCenter"),
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
      clearSearch: function () {
        const oComboProveedor = this.byId("proveedor"),
          oComboGrupo = this.byId("grupo");
        oComboProveedor.setValue("");
        oComboGrupo.setSelectedKey("");
      },
      clearAllFilters: function () {
        var oMultiComboBox = this.byId("subcategoryFilter");

        oMultiComboBox.removeAllSelectedItems();

        this.onSubcategorySelectionChange();
      },
      onSelectionChange: function () {
        this.byId("gridTable").setShowOverlay(true);
      },
      getProveedores: function () {
        const oModel = this.getOwnerComponent().getModel("report");
        const mProveedores = new JSONModel();
        oModel.read("/datosProveedorSet", {
          success: (data) => {
            // console.log(data);
            const oCount = this.getOwnerComponent().getModel("oCount");
            oCount.setData({ proveedores: data.results.length });
            mProveedores.setData(data.results);
            this.getView().setModel(mProveedores, "proveedores");
          },
        });
      },
      getCompradores: function () {
        const oModel = this.getOwnerComponent().getModel("report");
        const mCompradores = new JSONModel();
        oModel.read("/datosCompradorSet", {
          success: (data) => {
            // console.log(data);
            mCompradores.setData(data.results);
            this.getView().setModel(mCompradores, "compradores");
          },
        });
      },
      onValueHelpRequest: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
          oView = this.getView();

        if (!this._pValueHelpDialog) {
          this._pValueHelpDialog = Fragment.load({
            id: oView.getId(),
            name: "reportesobjetivos.fragment.ValueHelpDialog",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        this._pValueHelpDialog.then(function (oDialog) {
          // Create a filter for the binding
          oDialog.getBinding("items").filter([new Filter("Nombre", FilterOperator.Contains, sInputValue)]);
          // Open ValueHelpDialog filtered by the input's value
          oDialog.open(sInputValue);
        });
      },
      onValueHelpSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Nombre", FilterOperator.StartsWith, sValue);

        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      onValueHelpClose: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");

        oEvent.getSource().getBinding("items").filter([]);

        if (!oSelectedItem) {
          return;
        }

        this.byId("proveedor").setValue(oSelectedItem.getTitle());
      },
      onLiveChange: function (oEvent) {
        var input = oEvent.getSource();

        input.setValue(input.getValue().toUpperCase());
      },
    });
  }
);
