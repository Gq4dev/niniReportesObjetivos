/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "reportesobjetivos/model/models"], function (UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("reportesobjetivos.Component", {
    metadata: {
      manifest: "json",
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    config: {
      "fullWidth" : true
    },
    init: function () {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      // enable routing
      this.getRouter().initialize();

      this.setModel(new sap.ui.model.json.JSONModel(), "TempDataModel");
      this.setModel(new sap.ui.model.json.JSONModel({ version: "v" + this.getManifestEntry("/sap.app/applicationVersion/version") }), "version");
      // set the device model
      this.setModel(models.createDeviceModel(), "device");
    },
  });
});
