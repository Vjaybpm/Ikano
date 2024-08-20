# Dependent Data

This is a constant problem in guis

e.g.
* I have a list of parameters
* I have a list of tasks which is dependent on the parameters and one is selected
* I have a list of services which is dependent on the tasks and the parameters and one is selected

Then
* When I change the service it's no major impact
* When I change the task I need to undefined the service and reload the allowed list
* When I change the parameters I need to undefine the task and service and reload the allowed task 

I really want this declarative! Because it's messy. And because I want to be able to do this multiple times in multiple projects


Now we have several aspects to consider problems
* Expressing it
  * How do we say 'what to do if it's changed
  * How do we express equality?
* Doing it

## Expressing it

* How do we express the relationship
* How do we express equality

```typescript
const paramsI = nameAndStringDI ( lensToParams ) // This told us how to calculate the hash and where the item is
const taskListI = stringArrayDI ( lensToTaskList )
const taskI = string ( lensToTask )
const serviceListI = stringArrayDI ( lensToServiceList )
const serviceI = string ( lensToTask )

dependent ( dis, taskListI, loadTaskList, paramsI ) //so nuke the value if the params change
dependent ( dis, taskI, nuke, taskListI,  paramsI )
dependent ( dis, serviceListI, nuke, taskI )
dependent ( dis, serviceI, loadServiceList, serviceListI ) //skipped the redundancy
```
Now that is very clean to express the dependencies

BUT!!!
* how do we say the following
  * the task list should be emptied if the params change, then the list loaded
  * the service list should be emptied if the params or task change, then the list loaded
* It seems there are multiple concerns
  * What to do if it's changed 'nuke it' being the usual thing
  * Do I have enough information to go and get the data?
  * Should I go and get the data?
  * Other consideration
    * It takes time to fetch data and we don't really want to fetch it twice. 
    * It can 'go wrong' when we fetch it. how do we handle those errors

```typescript
const paramsI = nameAndStringDI ( lensToParams ) // This told us how to calculate the hash and where the item is

function taskListI<S> () { // Can easily have helper methods to make this
  return {
    type: stringArray,
    optional: Optional<S, string[]>,
    dependentOn: paramsI,
    whenUpstreamChanges: 'nuke',
    load: loadTaskList
  }
}

function taskI<S> () {
  return {
    type: string,
    optional: Optional<S, string>,
    dependentOn: [ paramsI, taskListI ],
    whenUpstreamChanges: 'nuke',
    load: undefined
  }
}

function serviceListI<S> () {
  return {
    type: stringArray,
    optional: Optional<S, string[]>,
    dependentOn: [ paramsI, taskListI, taskI ],
    whenUpstreamChanges: 'nuke',
    load: loadServiceList
  }
}

function serviceI<S> () {
  return {
    type: string,
    optional: Optional<S, string>,
    dependentOn: [ serviceListI ],
    whenUpstreamChanges: 'nuke'
  }
}

```

With helper methods

```typescript
const paramsI = nameAndStringDI ( lensToParams ) // This told us how to calculate the hash and where the item is
const taskListI = stringArrayDI ( lensToTaskList )
const taskI = string ( lensToTask )
const serviceListI = stringArrayDI ( lensToServiceList )
const serviceI = string ( lensToTask )

loadableDependent ( dis, taskListI, loadTaskList, paramsI ) //so nuke the value if the params change
dependent ( dis, taskI,  taskListI,  paramsI )
loadableDependent ( dis, serviceListI,  taskI )
dependent ( dis, serviceI, loadServiceList, serviceListI ) //skipped the redundancy

```
## Doing it
For the doing it, I think I'll just have the idea of a hash and if the hash changes the value has changed. That hash might be
an array of tags or a string...shouldn't really matter.

Clearly we need a dependency tree. Do we need to hierarchically sort it? Or do we just keep changing? Hierarchical sorting
is inevitable I think if we have more projects... it allows checks earlier with nicer message. Probably don't need at first.




