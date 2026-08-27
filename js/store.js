/* ============================================================
   Data store — mock data + localStorage persistence
   Namespace: window.LM
   ============================================================ */
(function () {
  const KEY = "lm_verify_db_v1";

  const INSTRUMENT_TYPES = [
    "Shop Weighing Scale",
    "Petrol/Fuel Dispenser",
    "Fair-Price Ration Scale",
    "Taxi / Auto Meter",
    "Weighbridge",
    "Beam Scale",
  ];

  const DISTRICTS = ["Pune", "Mumbai", "Nagpur", "Nashik", "Thane"];

  function daysFromNow(d) {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() + d);
    return t.toISOString().slice(0, 10);
  }

  function seed() {
    const traders = [
      { id: "TR-1001", name: "Rajesh Kumar", shop: "Kumar General Stores", district: "Pune", phone: "98220 11223", email: "trader@demo.in" },
      { id: "TR-1002", name: "Sunita Fuels Pvt Ltd", shop: "Sunita Petrol Pump", district: "Mumbai", phone: "98190 44556", email: "sunita@demo.in" },
      { id: "TR-1003", name: "Anil Sharma", shop: "Sharma Kirana & Ration", district: "Nagpur", phone: "94220 77889", email: "anil@demo.in" },
      { id: "TR-1004", name: "Meera Transport", shop: "Meera Auto Union", district: "Nashik", phone: "90280 33445", email: "meera@demo.in" },
    ];

    const inspectors = [
      { id: "IN-2001", name: "P. Deshmukh", district: "Pune", zone: "Zone A", phone: "97650 12345" },
      { id: "IN-2002", name: "S. Iyer", district: "Mumbai", zone: "Zone B", phone: "97650 22345" },
      { id: "IN-2003", name: "R. Gaikwad", district: "Nagpur", zone: "Zone C", phone: "97650 32345" },
    ];

    const instruments = [
      mkInst("WM-PN-4471", "Shop Weighing Scale", "Essae DS-252", "30 kg", "TR-1001", "Pune", "IN-2001", -320, 45),
      mkInst("WM-PN-4472", "Beam Scale", "Avery W-20", "20 kg", "TR-1001", "Pune", "IN-2001", -340, 25),
      mkInst("FD-MB-8830", "Petrol/Fuel Dispenser", "Gilbarco SK700", "6 nozzle", "TR-1002", "Mumbai", "IN-2002", -350, 15),
      mkInst("FD-MB-8831", "Petrol/Fuel Dispenser", "Midco Multiflow", "4 nozzle", "TR-1002", "Mumbai", "IN-2002", -400, -35),
      mkInst("RS-NG-2205", "Fair-Price Ration Scale", "Essae PSE", "100 kg", "TR-1003", "Nagpur", "IN-2003", -300, 65),
      mkInst("RS-NG-2206", "Fair-Price Ration Scale", "Phoenix TX", "50 kg", "TR-1003", "Nagpur", null, -395, -30),
      mkInst("TM-NS-1190", "Taxi / Auto Meter", "Pricol AutoM", "Fare meter", "TR-1004", "Nashik", null, -360, 5),
      mkInst("WB-PN-0067", "Weighbridge", "Sartorius 60T", "60 tonne", "TR-1001", "Pune", "IN-2001", -200, 165),
      mkInst("WM-MB-5540", "Shop Weighing Scale", "Essae DS-415", "10 kg", "TR-1002", "Mumbai", "IN-2002", -100, 265),
      mkInst("TM-NS-1191", "Taxi / Auto Meter", "Pricol AutoM", "Fare meter", "TR-1004", "Nashik", "IN-2001", -370, -5),
    ];

    const applications = [
      mkApp("AP-90012", "TR-1004", "Meera Transport", "Taxi / Auto Meter", "Pricol AutoM", "Nashik", "Pending", null, -2, 800, false),
      mkApp("AP-90013", "TR-1003", "Anil Sharma", "Fair-Price Ration Scale", "Phoenix TX", "Nagpur", "Assigned", "IN-2003", -1, 600, true),
      mkApp("AP-90014", "TR-1002", "Sunita Fuels Pvt Ltd", "Petrol/Fuel Dispenser", "Midco Multiflow", "Mumbai", "Pending", null, 0, 1500, false),
      mkApp("AP-90015", "TR-1001", "Rajesh Kumar", "Shop Weighing Scale", "Essae DS-252", "Pune", "Scheduled", "IN-2001", -3, 500, true),
    ];

    return {
      traders, inspectors, instruments, applications,
      session: { role: "trader", id: "TR-1001", name: "Rajesh Kumar" },
      seq: { app: 90016, inst: 6000, cert: 4500 },
    };

    function mkInst(serial, type, model, cap, traderId, district, inspectorId, verifiedOffset, expiryOffset) {
      const trader = traders.find((t) => t.id === traderId);
      const inspector = inspectors.find((i) => i.id === inspectorId);
      const verified = verifiedOffset != null;
      return {
        serial, type, model, capacity: cap,
        traderId, traderName: trader ? trader.name : "",
        shop: trader ? trader.shop : "", district,
        inspectorId: inspectorId || null,
        inspectorName: inspector ? inspector.name : null,
        lastVerified: verified ? daysFromNow(verifiedOffset) : null,
        expiry: verified ? daysFromNow(expiryOffset) : null,
        certNo: verified ? "LM-CERT-" + serial.replace(/[^0-9]/g, "").slice(0, 4) + "-24" : null,
        fee: 500,
      };
    }

    function mkApp(id, traderId, traderName, type, model, district, status, inspectorId, appliedOffset, fee, feePaid) {
      const inspector = inspectors.find((i) => i.id === inspectorId);
      return {
        id, traderId, traderName, type, model, district, status,
        inspectorId: inspectorId || null,
        inspectorName: inspector ? inspector.name : null,
        applied: daysFromNow(appliedOffset),
        scheduled: status === "Scheduled" || status === "Assigned" ? daysFromNow(3) : null,
        fee, feePaid,
      };
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    const fresh = seed();
    save(fresh);
    return fresh;
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  const LM = {
    KEY,
    INSTRUMENT_TYPES,
    DISTRICTS,
    db: load(),

    reset() {
      localStorage.removeItem(KEY);
      this.db = load();
    },
    persist() { save(this.db); },

    /* ---- status derivation ---- */
    statusOf(inst) {
      if (!inst.expiry || !inst.lastVerified) return "pending";
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const exp = new Date(inst.expiry);
      const diff = Math.round((exp - today) / 86400000);
      if (diff < 0) return "expired";
      if (diff <= 30) return "due";
      return "verified";
    },
    daysToExpiry(inst) {
      if (!inst.expiry) return null;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return Math.round((new Date(inst.expiry) - today) / 86400000);
    },

    /* ---- queries ---- */
    instrumentsByTrader(id) { return this.db.instruments.filter((i) => i.traderId === id); },
    appsByTrader(id) { return this.db.applications.filter((a) => a.traderId === id); },
    appsByInspector(id) { return this.db.applications.filter((a) => a.inspectorId === id); },
    instrumentsByInspector(id) { return this.db.instruments.filter((i) => i.inspectorId === id); },
    findInstrument(q) {
      q = (q || "").trim().toLowerCase();
      return this.db.instruments.find(
        (i) => i.serial.toLowerCase() === q || (i.certNo && i.certNo.toLowerCase() === q)
      );
    },

    /* ---- mutations ---- */
    addApplication(data) {
      const id = "AP-" + this.db.seq.app++;
      const app = {
        id, status: "Pending", inspectorId: null, inspectorName: null,
        applied: daysFromNow(0), scheduled: null, feePaid: false, ...data,
      };
      this.db.applications.unshift(app);
      this.persist();
      return app;
    },
    payFee(appId) {
      const a = this.db.applications.find((x) => x.id === appId);
      if (a) { a.feePaid = true; this.persist(); }
      return a;
    },
    assignInspector(appId, inspectorId) {
      const a = this.db.applications.find((x) => x.id === appId);
      const insp = this.db.inspectors.find((i) => i.id === inspectorId);
      if (a && insp) {
        a.inspectorId = inspectorId;
        a.inspectorName = insp.name;
        a.status = "Assigned";
        a.scheduled = daysFromNow(3);
        this.persist();
      }
      return a;
    },
    completeVerification(appId, result) {
      const a = this.db.applications.find((x) => x.id === appId);
      if (!a) return null;
      if (result.pass) {
        a.status = "Verified";
        const serial = data_makeSerial(a);
        const certNo = "LM-CERT-" + this.db.seq.cert++;
        const inst = {
          serial, type: a.type, model: a.model || "—", capacity: result.capacity || "—",
          traderId: a.traderId, traderName: a.traderName,
          shop: (this.db.traders.find((t) => t.id === a.traderId) || {}).shop || "",
          district: a.district,
          inspectorId: a.inspectorId, inspectorName: a.inspectorName,
          lastVerified: daysFromNow(0), expiry: daysFromNow(365),
          certNo, fee: a.fee,
        };
        this.db.instruments.unshift(inst);
        a.resultCert = certNo;
      } else {
        a.status = "Rejected";
        a.rejectReason = result.reason || "Did not meet accuracy tolerance";
      }
      this.persist();
      return a;

      function data_makeSerial(app) {
        const p = { "Shop Weighing Scale": "WM", "Beam Scale": "WM", "Petrol/Fuel Dispenser": "FD",
          "Fair-Price Ration Scale": "RS", "Taxi / Auto Meter": "TM", "Weighbridge": "WB" }[app.type] || "WM";
        const dc = (app.district || "XX").slice(0, 2).toUpperCase();
        return p + "-" + dc + "-" + Math.floor(1000 + Math.random() * 8999);
      }
    },
    renewInstrument(serial) {
      const inst = this.db.instruments.find((i) => i.serial === serial);
      if (!inst) return null;
      const app = this.addApplication({
        traderId: inst.traderId, traderName: inst.traderName, type: inst.type,
        model: inst.model, district: inst.district, fee: inst.fee || 500,
        isRenewal: true, renewSerial: serial,
      });
      return app;
    },
  };

  window.LM = LM;
})();
