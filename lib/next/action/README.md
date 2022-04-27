#Actions

* On the client side we have
  * A fetcher we call channel what connects (fetch POST request) to the backend and streams actions asyncronously to the backend
  * An action source with a queue that feeds a ReadableStream to the fetcher A.K.A. The Channel
  * A reducer consuming the response stream from fetcher A.K.A. The Channel an applying the proper actions such as 'alert' and 'patch' (those are the only)

* On the server side we have:
  * A middleware capturing the resquest
  * The Broker that captures the requested actions and channels them through action queues
  * The Consumer that owns a single action queue and responds trough an AsycIterator of actions and terminates when it is done or with a 'quit' action.
  * The output that responds with the actions from each active AsyncIterator though a ReadableStream

client: user -> channel -> reducer
server: middleware -> broker -> [queue | The Consumer | iterator] -> output

## Action Brokers

* queue - the base broker
* mongo - mongo db
* split - a splitter to other brokers