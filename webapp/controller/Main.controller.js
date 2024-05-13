sap.ui.define(
  ["reportesobjetivos/controller/BaseController"],
  
  function (BaseController) {
    "use strict";

    return BaseController.extend("reportesobjetivos.controller.Main", {
      onInit: function () {},
      pressReportSubCategory: function () {
        this.getRouter().navTo("RouteReportSubCategories");
      },
      pressReportCategory: function () {
        this.getRouter().navTo("RouteReportCategories");
      },
    });
  }
);
