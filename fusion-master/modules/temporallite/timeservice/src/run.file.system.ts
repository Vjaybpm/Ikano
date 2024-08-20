#!/usr/bin/env node
import { defaultTimeServiceData, fileTimeSystem, killFileTimeSystem, TimeserviceData } from "./file.time.service";

function log ( message: string, error: boolean ) {
  if ( error ) {
    console.error ( message );
  } else {
    console.log ( message );
  }
}


let timeServiceData: TimeserviceData = {
  ...defaultTimeServiceData ( 'target/timeTest.txt', log ),
  timeBetweenChecksms: 100
};
let count = 0;
setInterval ( () => {
  const adjustedTime = fileTimeSystem ( timeServiceData ) ()
  if ( count++ % 5 === 0 ) killFileTimeSystem ( timeServiceData )
  console.log ( `${count} Adjusted Time: ${adjustedTime}` );
}, 500 );
