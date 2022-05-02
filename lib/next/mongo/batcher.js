class MongoBatcher {
  constructor(db, collectionName, chunkSize, batchSize) {
    this.db = db;
    this.collectionName = collectionName;
    this.chunkSize = chunkSize;
    this.batchSize = batchSize;
    this.batches = [
      {
        records: [],
      },
    ];
  }

  initBatch() {}

  async addRecord(record) {
    let i = this.batches.length - 1;
    this.batches[i].records.push(record);

    if (this.batches[i].records.length >= this.batchSize) {
      if (this.batches.length >= this.chunkSize) {
        let batchesToExecute = this.batches;
        this.batches = [
          {
            records: [],
          },
        ];
        await this.saveBatchesInMongo(batchesToExecute);
      } else {
        this.batches.push({
          records: [],
        });
      }
    }
  }

  async flush() {
    let batchesToExecute = this.batches;
    this.batches = [
      {
        records: [],
      },
    ];

    await this.saveBatchesInMongo(batchesToExecute);
  }

  async saveBatchesInMongo(batchesToExecute) {
    let promises = [];
    for (let batch of batchesToExecute) {
      console.log("invoking insert");
      promises.push(
        this.db.collection(this.collectionName).insertMany(batch.records, {
          writeConcern: { w: "majority" },
        })
      );
    }
    await Promise.all(promises);
  }
}

export default MongoBatcher;
