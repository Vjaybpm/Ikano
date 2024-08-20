This is a tool for managing hierarchical configuration files

# Hierarchical configuration
Heavily inspired by Hiera, but with a few key differences:

* We can 'save' the whole file
  * Hiera is about 'what is this property in this context' and it's hard to get the whole file
* We have plugins that can enrich the file with more data
  * This allows us to specify less.
  * It allows the plugins to reshape the file so that we can have optimial 'data entry' format and optional 'understanding of the consequences'
* We can precache all the permutations of the file
  * This allows us to quickly find the right file for a given context
  * This is useful for testing

# Transformation Plugins

The primary use case this tool was developer for is to handle transformations.

## Glossary

* Task: A thing we want to do
* Service: A way of implementing the Task
* Schema: A data format
  * We have four important schemas: Task Request, Task Response, Service Request, Service Response
* Transformer: Turns a Task Request into a Service Request or a Service Response into a Task Response

