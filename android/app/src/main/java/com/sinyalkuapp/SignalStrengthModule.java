package com.sinyalkuapp;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.telephony.TelephonyManager;
import android.telephony.CellInfo;
import android.telephony.CellSignalStrength;
import java.util.List;

public class SignalStrengthModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  public SignalStrengthModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "SignalStrengthModule";
  }

  @ReactMethod
  public void getSignalStrength(Callback callback) {
    try {
      TelephonyManager telephonyManager = (TelephonyManager) reactContext.getSystemService(reactContext.TELEPHONY_SERVICE);
      List<CellInfo> cellInfoList = telephonyManager.getAllCellInfo();

      if (cellInfoList != null && !cellInfoList.isEmpty()) {
        CellSignalStrength cellSignalStrength = (CellSignalStrength) cellInfoList.get(0).getCellSignalStrength();
        int dbm = cellSignalStrength.getDbm();
        callback.invoke(null, dbm);
      } else {
        callback.invoke(null, -99);
      }
    } catch (Exception e) {
      callback.invoke(e.getMessage(), -120);
    }
  }
}