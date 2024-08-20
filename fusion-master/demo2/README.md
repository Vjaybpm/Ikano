# Do we want to talk about this

## Schemas

The problem with these schemas is that we have created a monolith. It's been created because of how the back end systems
work

Let's explore why it is a problem

## Out of band communication

Every Kafka topic that supports a service has a schema. Any one that is going to post to that topic needs to know the
schema

* This is true anyway
* BUT we are working with concrete implementations instead of representations

Example of the problem

Posting a name:

The service is expecting data like this:

```json
{
  "firstname": "John",
  "lastname":  "Doe"
}
```

But what about in the netherlands?

```json
{
  "firstname":     "Jan",
  "tussenvoegsel": "van",
  "lastname":      "Jansen"
}
```

Posting an address:
In the US:

```json
{
  "street": "123 Main St",
  "city":   "Anytown",
  "state":  "NY",
  "zip":    "12345"
}
```

In the UK:

```json
{
  "street":   "123 Main St",
  "city":     "Anytown",
  "postcode": "AB1 2CD"
}
```

In Switzerland:

```json
{
  "street":   "123 Hauptstrasse",
  "city":     "Zurich",
  "postcode": "8000",
  "canton":   "Zurich",
  "country":  "Switzerland"
}
```

Nightmare.

But there is a solution.

# More abstract

We could have a 'uk service' a 'de service' a 'us service' and so on. But that's a lot of services.

Alternatively we could have

* Axes of complexity.
    * Whatever you want for this application
        * GEO / Product / Channel
        * Just GEO
        * Brand / Geo

```yaml
file1: #'uk_name.yaml'
  name:
    title: [ Mr, Mrs, Ms, Dr ]
    firstname: string
    lastname: string
  address:
    uk:
      street: string
      city: string
      county: string
      postcode: string
file2: #'nl_name.yaml'
  name:
    title: [ Dhr, Mevr, Dr, Ir ]
    firstname: string
    tussenvoegsel: string
    lastname: string
  address:
    street: string
    city: string
    county: string
    postcode: string
file3: #'us_name.yaml'

  address:
    street: string
    city: string
    state: string
    zip: number
file4: # 'ch_name.yaml'
  street: string
  city: string
  postcode: number
  canton: string
```
So for any permutation of axes of complexity we can find what we need for a name / address or other namespace.

# Processing the data
We need to be able to do
* Indexing
* Searching
* Summarisation
* Validation
* Map to a schema (usually to send to external world)
* Derive from a schema (usually from the external world)
* Display
* Edit

Well we have code on demand. And we can use lens and a compositional story to get the data we need through a text
language... which needs a whole other discussion. But is awesome

## Sending data to external system

Let's look at how we could send data to a credit check.
* We know the schema that the precise service needs (we use optics to describe it, and include default logic)
* We know what data we have for our axes of complexity (above service/file)
* We can auto map between the two at 'compile time' aka fully cachable

For each country we have a list of fields that the credit check needs for a name. Another list for addresses.
We map the data to the schema that the credit check needs for name. Again for address. This mapping can be cached

## Viewing / Editing data on a gui

### Option 1: Code on demand

* View (Compact,summary, full - three levels) or edit
* A react component for each option distributed as a microservice
* css handled by the application
* Simple interface to set/get data

### Option 2: Abstract components

* View (Compact,summary, full - three levels) or edit
* We have a single react component that uses the data from the name space about that country

## Editing data on a gui

Example:

Login

* Netherlands
    * Username
    * Password
* Belgium
    * gebruikersnaam
    * bankcardid

Each country has mechanisms it can use.

Now when we are doing work with these objects we just pass it along as json. With the country code and name space.

How do we show this on the guis? Options:

* Well we have another microservice that returns the react components that we need.  (my preferred option. Because often
  there is minutia in expectations about display)
* We have abstract components that understand the country code, get the metadata and know how to display and edit it

How do we process it

* We have external systems that need data in a particular format
    * We code up a transformer for each country for that namespace
* We have internal new systems.
    * They work at this level of abstraction. The address is just a blob of data passed along, or ripped apart and put
      back together
    * For example when we do search we do string searching aka google rather than 'this first name, this last name'
    * We can use event sourcing as our data model.

Typically we have system of records that already handle this somehow. Usually in a mess

or//

We have the 'messed up by the numbers' that almost every architecture has

### Advantages

* It's easy to understand (and this is a big thing)
* It will work. It's testable. It's maintainable.

### Disadvantages

* Changes are still hard to make
    * Made easier by the sample data, the contract testing, but still hard
* We code up in all out systems the knowledge of how things work
* This