
# Time Synchronization Service
## Overview
This Time Synchronization Service is designed to ensure accurate timekeeping across distributed systems by adjusting the local time based on the file system's time metadata. It uses Node.js and TypeScript to monitor and adjust the system clock in relation to the last modified time of a specified file. This project includes functionality to start the service, perform continuous time checks, and handle errors robustly.

## Motivations
* I don't want the pain of a central coordinator (like Zookeeper)
* That means I want to do file locking across multiple machines. 
  * This needs me to handle timed out locks
  * This allows me to 'know' that the servers are all within (say) a second of each other.
* Note that it doesn't adjust the system clock, it just provides a timeservice that is approximately consistent across all the machines.
* It is not a replacement for NTP, but can work when (say) the file system is on a SAN, or a NFS and they are different time boundaries

## Features
* Initial Time Check: Validates the system's current time against a specified file's last modified time to establish an initial time offset.
* Continuous Synchronization: Regularly checks and adjusts the system's time based on the initial offset, ensuring ongoing accuracy.
* Error Handling: Catches and logs errors during synchronization checks to maintain stability and provide debugging information.
* Idempotent Start Function: Can be safely called multiple times without adverse effects, ensuring robustness in dynamic environments.
# How It Works
* File Time Check: The service reads the modification time of a specified file and calculates the difference from the current system time.
* Offset Adjustment: This difference (offset) is then used to adjust subsequent time checks to align the system clock closer to the file's last modification time.
* Logging: All operations are logged, with errors highlighted, to assist with monitoring and troubleshooting.

# Installation
Install the necessary dependencies by navigating to your project directory and running:
```shell
npm install "@fusionconfig/timeservice"
```
# Usage
To start the time synchronization service:

```javascript
const timeServiceData = defaultTimeServiceData('path/to/your/testfile.txt', logFunction);
const getCurrentAdjustedTime = fileTimeSystem(timeServiceData);

setInterval(() => {
console.log(`Adjusted Time: ${getCurrentAdjustedTime()}`);
}, 1000);
Replace 'path/to/your/testfile.txt' with the path to the file you wish to monitor and logFunction with a function to handle logs.
```

## Logging
You need to provide a log function to handle logging and error messages. The log function should accept a message string and a boolean indicating whether the message is an error. For example:
```javascript
```shell
log: ( message: string, error: boolean ) => void;
```
# Configuration
Adjust the service configuration by modifying the defaultTimeServiceData function parameters:

* filenameForTest: Path to the file used for time checks.
* log: Function used to output logs and errors.
* timeBetweenChecksms: Interval in milliseconds for time checks.
* maximumAllowedOffset and maximumAllowedDrift: Maximum permissible deviations for time offsets.

# Stopping the Service
This is probably only needed in tests. Normally you would leave this running.
To stop it you need to have access to the `timeServiceData`. Normally you wouldn't bother

```typescript
let timeServiceData = defaultTimeServiceData ( 'target/timeTest.txt', log );
let timeService = fileTimeSystem ( timeServiceData );
//use the timeService
   
killFileTimeSystem ( timeServiceData )
```

# License
This project is licensed under the MIT License 

https://chat.openai.com/share/d0604aed-25bc-4881-a1b3-fea75ed6b9bc
