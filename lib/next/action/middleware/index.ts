import { NextRequest, NextResponse } from 'next/server';
import Database from '../../mongo/actor';
import Broker from './request-broker';
import Sink from './request-sink';
import Source from './response-producer';

/** API */
export default function middleware(req: NextRequest) {
  if (req.body === null) {
    return NextResponse.next();
  }
  const broker = new Broker(
    // register consumers
    new Database()
  );

  req.body.pipeTo(
    new WritableStream(new Sink(broker))
  );

  return new Response(
    new ReadableStream(
      new Source(broker)
    ),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}