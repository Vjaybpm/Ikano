
export type ReqRespAction = 'Summary' |
  'TaskRequestInput' | 'RequestTransform' | 'ServiceRequestInput' |
  'ServiceResponseOutput' | 'ResponseTransform' | 'TaskResponseOutput'

export const reqRespOptions: ReqRespAction[] = [
  'Summary',
  'TaskRequestInput', 'RequestTransform', 'ServiceRequestInput',
  'ServiceResponseOutput', 'ResponseTransform', 'TaskResponseOutput',
]
export const summary: ReqRespAction = 'Summary'
export const taskRequestInput: ReqRespAction = 'TaskRequestInput'
export const requestTranform: ReqRespAction = 'RequestTransform'
export const serviceRequestInput: ReqRespAction = 'ServiceRequestInput'
export const serviceResponseOutput: ReqRespAction = 'ServiceResponseOutput'
export const responseTransform: ReqRespAction = 'ResponseTransform'
export const taskResponseOutput: ReqRespAction = 'TaskResponseOutput'
