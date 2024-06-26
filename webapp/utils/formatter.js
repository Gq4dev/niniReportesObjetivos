sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
    "use strict";
    return {
      formatPercentage: function (sValue) {
        console.log(sValue);
        //   return sValue !== Nan ? sValue : 0;
      },
      formatUsuarioFechaHora: function (dFecha, dHora) {
        if (!dFecha || !dHora) {
          return "";
        }
        var sFormattedFecha = dFecha.substr(6, 2) + "/" + dFecha.substr(4, 2) + "/" + dFecha.substr(0, 4);
        var sFormattedHora = dHora.substr(0, 2) + ":" + dHora.substr(2, 2) + ":" + dHora.substr(4, 2);
  
        return sFormattedFecha + " - " + sFormattedHora;
      },
      objetive: function (objetive) {
        if (isNaN(objetive) || objetive < 0) {
          return sap.ui.core.ValueState.Error;
        } else {
          return sap.ui.core.ValueState.Success;
        }
      },
      progress: function (realSale, objBalanceWith) {
        var value = (realSale / objBalanceWith) * 100;
  
        if (isNaN(value) || value < 0) {
          return sap.ui.core.ValueState.Error;
        } else if (value < 60) {
          return sap.ui.core.ValueState.Warning;
        } else if (value < 100) {
          return sap.ui.core.ValueState.Information;
        } else {
          return sap.ui.core.ValueState.Success;
        }
      },
      formatPercentage: function (salesYear, objBalanceWith) {
        if (objBalanceWith === 0) {
          return ""; 
        }
        let percentage = (salesYear / objBalanceWith) * 100;
        return percentage.toFixed(2) + "%"; 
      },
    };
  });
  