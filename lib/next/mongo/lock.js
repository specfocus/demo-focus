class LockManager {

  // Use it for tenant synchronize
  static async synchronize(tenant, moduleName, lock_id, syncFunc, maxTimeoutMS = 1 * 60 * 1000) {
    const tenant_id = tenant.profile._id;
    let db = tenant.context.db;
    return LockManager.synchronizeTask(db, tenant_id, moduleName, lock_id, syncFunc, maxTimeoutMS);
  }

  // Use it for global synchronize, across tenants
  static async synchronizeGlobal(db, moduleName, lock_id, syncFunc, maxTimeoutMS = 1 * 60 * 1000) {
    const tenant_id = 'global';
    return LockManager.synchronizeTask(db, tenant_id, moduleName, lock_id, syncFunc, maxTimeoutMS);
  }

  // Base implementation of synchronize
  static async synchronizeTask(db, tenant_id, moduleName, lock_id, syncFunc, maxTimeoutMS = 1 * 60 * 1000) {
    console.info(`synchronize ${moduleName} ${tenant_id} ${lock_id}`);
    let syncResult = null;

    const wait = ms => new Promise(res => setTimeout(res, ms));
    let collection = db.collection("LockManager");

    const lock_rec_id = {
      moduleName: moduleName,
      lock_id: lock_id
    };

    let waiting = true;
    let now = Date.now();

    do {

      let findUpdate = {
        _id: lock_rec_id,
        // Search is looking for timedout lock
        // update if lock timed out
        //  now = 0
        //  timestamp = 0
        //  now = 1000  (after created - still good)
        //  maxTimeoutMS = 60000
        //   0 < (1000 - 60000) == false
        timestamp: {
          $lte: now - maxTimeoutMS
        }
      };

      now = Date.now();

      try {
        console.info(`[${tenant_id}] attempt lock acquire ${JSON.stringify(findUpdate)}`);

        let ret = await collection.findAndModify(
          findUpdate, [
            ["timestamp", -1]
          ], {
            $set: {
              timestamp: now
            },
            $setOnInsert: {
              _id: lock_rec_id
            }
          }, {
            new: true,
            upsert: true,
            w: 1
          }
        );

        if (ret == null) { // no document modified
          console.info("No lock acquired");
          throw "No lock acquired";
        }
        console.info(`[${tenant_id}] lock acquired, ${JSON.stringify(findUpdate)}`);
        waiting = false;
      } catch (e) {
        console.info(`[${tenant_id}] waiting on lock findUpdate ${JSON.stringify(findUpdate)}`);
        console.info(`[${tenant_id}] waiting on lock error %o`, e);
        await wait(5000);
      }

    } while (waiting);

    try {
      syncResult = await syncFunc();
    } catch (se) {
      console.error(`[${tenant_id}] Error in LockManager syncFun: ${lock_id}: ${se}`);
    }


    try {
      console.info(`[${tenant_id}] attempt lock free  ${lock_id}`);

      // TEST BY SETTING and comment out next let : let ret = null;

      let ret = await collection.findAndModify({
        _id: lock_rec_id,
        timestamp: now
      }, [
        ["timestamp", -1]
      ], {
        timestamp: now
      }, {
        remove: true,
        w: 1
      });


      if (ret == null) { // no document modified
        console.info(`[${tenant_id}] Could not find lock - it must have expired ${lock_id}`);
      } else {
        console.info(`[${tenant_id}] lock freed: ${lock_id}`);
      }
    } catch (lockError) {
      console.error(`[${tenant_id}] Error in LockManager removing lock for ${lock_id}:${lockError}`);
    }
    return syncResult;
  }
}

export default LockManager;
