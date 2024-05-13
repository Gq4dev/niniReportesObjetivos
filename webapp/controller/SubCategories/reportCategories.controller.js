sap.ui.define([
    "reportesobjetivos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("reportesobjetivos.controller.SubCategories.reportCategories", {
        onInit: function () {
            var oModel = new JSONModel({
                items: [
                    {
                        "subCategory": "Arroz",
                        "year": [
                            {
                                "month": "Enero",
                                "objBalance": 1650,
                                "objBalanceWith": 1650,
                                "realSale": 1550,
                                "status": "Failed",
                                "statusState": "Warning",
                                "deliveryProgress": 90
                            },
                            {
                                "month": "Febrero",
                                "objBalance": 1050,
                                "objBalanceWith": 1150,
                                "realSale": 1500,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            },
                            {
                                "month": "Marzo",
                                "objBalance": 2200,
                                "objBalanceWith": 2200,
                                "realSale": 1800,
                                "status": "Failed",
                                "statusState": "Error",
                                "deliveryProgress": 20
                            },
                            {
                                "month": "Abril",
                                "objBalance": 2300,
                                "objBalanceWith": 2450,
                                "realSale": 3000,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            }
                        ]
                    },
                    {
                        "subCategory": "Bebidas",
                        "year": [
                            {
                                "month": "Enero",
                                "objBalance": 2100,
                                "objBalanceWith": 2100,
                                "realSale": 2300,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            },
                            {
                                "month": "Febrero",
                                "objBalance": 2800,
                                "objBalanceWith": 2800,
                                "realSale": 1800,
                                "status": "In Progress",
                                "statusState": "Warning",
                                "deliveryProgress": 60
                            },
                            {
                                "month": "Marzo",
                                "objBalance": 2200,
                                "objBalanceWith": 2200,
                                "realSale": 1800,
                                "status": "Failed",
                                "statusState": "Error",
                                "deliveryProgress": 90
                            },
                            {
                                "month": "Abril",
                                "objBalance": 2300,
                                "objBalanceWith": 2450,
                                "realSale": 3000,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            }
                        ]
                    },
                    {
                        "subCategory": "Automotor",
                        "year": [
                            {
                                "month": "Enero",
                                "objBalance": 2100,
                                "objBalanceWith": 2100,
                                "realSale": 2300,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            },
                            {
                                "month": "Febrero",
                                "objBalance": 2800,
                                "objBalanceWith": 2800,
                                "realSale": 1800,
                                "status": "In Progress",
                                "statusState": "Warning",
                                "deliveryProgress": 60
                            },
                            {
                                "month": "Marzo",
                                "objBalance": 2200,
                                "objBalanceWith": 2200,
                                "realSale": 1800,
                                "status": "Failed",
                                "statusState": "Error",
                                "deliveryProgress": 90
                            },
                            {
                                "month": "Abril",
                                "objBalance": 2300,
                                "objBalanceWith": 2450,
                                "realSale": 3000,
                                "status": "Delivered",
                                "statusState": "Success",
                                "deliveryProgress": 100
                            }
                        ]
                    }
                ]
            });
            this.getView().setModel(oModel);


            var aSubCategories = oModel.getProperty("/items");
            var aSubCategoriesNames = [];

            // Recorrer los meses y agregar solo los nombres al nuevo array
            for (var i = 0; i < aSubCategories.length; i++) {
                aSubCategoriesNames.push(aSubCategories[i].subCategory);
            }

            var oSubCategoriesModel = new sap.ui.model.json.JSONModel({
                subCategories: aSubCategoriesNames
            });


            this.getView().setModel(oSubCategoriesModel, "subCategoriesNamesModel");


        },
        onSubCategorySelect: function (oEvent) {
            var sSelectedCategory = oEvent.getSource().getSelectedItem().getText();
            var oModel = this.getView().getModel(); // Obtener el modelo original
            var aItems = oModel.getProperty("/items");

            // Buscar el objeto correspondiente al mes seleccionado
            var oSelectedCategoryData = aItems.find(function (item) {
                return item.subCategory === sSelectedCategory;
            });

            // Obtener solo las categorías del objeto seleccionado
            var aSelectedMonths = oSelectedCategoryData ? oSelectedCategoryData.year : [];

            // Crear un nuevo modelo con las categorías seleccionadas
            var oFilteredModel = new sap.ui.model.json.JSONModel({
                months: aSelectedMonths
            });

    

            // Establecer el nuevo modelo en la tabla
            this.getView().byId("reportSubCategoriesTable").setModel(oFilteredModel);
        }

    });
});