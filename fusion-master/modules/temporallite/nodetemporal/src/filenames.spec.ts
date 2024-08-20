import { fileNextInstanceId, getRootWorkspaceInstanceName } from "./filenames";
import fs from "fs";
import path from "node:path";

const mockTimeService = (): number => Date.UTC ( 2024, 3, 27, 14, 30, 0 );
describe ( 'getRootWorkspaceInstanceName', () => {
  // Mock time service to return a fixed timestamp
  // Note: Months are 0-indexed in Date.UTC (3 = April)


  it ( 'should format the workspace instance name correctly', () => {
    const workflowId = 'workflow123';
    const expectedOutput = 'workflow123/2024-04/27-14/30';
    const result = getRootWorkspaceInstanceName ( mockTimeService, workflowId );
    expect ( result ).toBe ( expectedOutput );
  } );

  it ( 'should handle different times and workflow IDs', () => {
    // Another time setting
    const anotherMockTimeService = (): number => new Date ( '2024-12-31T23:59:00Z' ).getTime ();
    const anotherWorkflowId = 'workflow456';
    const expectedOutput = 'workflow456/2024-12/31-23/59';
    const result = getRootWorkspaceInstanceName ( anotherMockTimeService, anotherWorkflowId );
    expect ( result ).toBe ( expectedOutput );
  } );
} );


describe ( 'File Operation Tests', () => {
  let tempDir;


  //could do with more goodness around this
  it ( 'should generate a unique file path based on the given config and workflow ID', async () => {
    // Setup configuration
    const config = {
      timeService: mockTimeService, // Simple time service for testing
      workspace: tempDir, // Use the temporary directory as workspace
      template: '{seq}.events'
    };

    const workflowId = 'testWorkflow';
    const generatePath = fileNextInstanceId ( config );


    // Execute the function to test
    const uniquePath = (await generatePath ( workflowId )).replace ( /\\/g, '/' );

    // Verify the output
    expect ( uniquePath ).toMatch ( /^testWorkflow\/2024-04\/27-14\/30\/\d+$/ );

    // Check if the directory and file were created
    const fullPath = path.join ( tempDir, uniquePath );
    expect ( fs.existsSync ( fullPath + ".events") ).toBeTruthy ();
  } );
} );