import { MongoClient } from 'mongodb';

interface Metrics {
  op: any;
  ns: any;
  'command.getMore': any;
  'command.collection': any;
  'command.batchSize': any;
  'command.aggregate': any;
  'command.pipeline': any;
  //'command.\\$truncated': 'command.truncated',
  'command.find': any;
  'command.filter': any;
  'originatingCommand.aggregate': any;
  'originatingCommand.pipeline': any;
  docsExamined: any;
  count: number;
  millis: number;
  avg_millis: number;
  last_millis: number;
}

const COLLECTION_NAME = 'system.profile';

const performace = async (client: MongoClient, dbName: string): Promise<Metrics[]> => {
  const db = client.db(dbName);
  const collection = db.collection(COLLECTION_NAME);

  const pipeline =
    [
      { $match: {} },
      {
        $project:
        {
          'op': true,
          'ns': true,
          'command.getMore': true,
          'command.collection': true,
          'command.batchSize': true,
          'command.aggregate': true,
          'command.pipeline': true,
          //'command.\\$truncated': 'command.truncated',
          'command.find': true,
          'command.filter': true,
          'originatingCommand.aggregate': true,
          'originatingCommand.pipeline': true,
          'docsExamined': true,
          'millis': true
        }
      },
      {
        $group:
        {
          _id: {
            op: '$op',
            ns: '$ns',
            command: '$command',
            'originatingCommand': '$originatingCommand',
          },
          count: { $sum: 1 },
          millis: { $sum: '$millis' },
          avg_millis: { $avg: '$millis' },
          last_millis: { $last: '$millis' }
        }
      },
      { $sort: { 'millis': -1 } }
    ];


  const results = await collection.aggregate(pipeline).toArray();

  // console.log('results:', JSON.stringify(results, null, ' '));
  return results as Metrics[];
};

export default performace;
