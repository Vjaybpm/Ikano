
export type ActivitySucessfulEvent = {
  id: string
  success: any
}
export function isActivitySucessfulEvent<T> ( item: ActivityEvent ): item is ActivitySucessfulEvent {
  return (item as ActivitySucessfulEvent).success !== undefined
}
export type ActivityFailedEvent = {
  id: string
  failure: any
}
export function isActivityFailedEvent ( item: ActivityEvent ): item is ActivityFailedEvent {
  return (item as ActivityFailedEvent).failure !== undefined
}
export type ActivityEvent = ActivitySucessfulEvent | ActivityFailedEvent
export type ActivityEvents = ActivityEvent[]
