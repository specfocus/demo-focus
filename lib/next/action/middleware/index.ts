import { NextRequest, NextResponse } from 'next/server';
import Broker from './request-broker';
import Sink from './request-sink';
import Source from './response-source';

/** API */
export default function middleware(req: NextRequest) {
  if (req.body === null) {
    return NextResponse.next();
  }
  const broker = new Broker();
  // register consumers
  // const consumer = new Consumer();
  // broker.add(consumer);
  const sink = new Sink(broker);
  const source = new Source(broker);
  req.body.pipeTo(new WritableStream(sink));
  const stream = new ReadableStream(source);
  return new Response(
    stream,
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}