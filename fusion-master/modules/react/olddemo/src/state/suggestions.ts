export const tx_suggestion = `{
  "loan_application_id": applicationId,
  "type": $lowercase($substringBefore(loanType, " ")),
  "amount": amountRequested,
  "currency": currency,
  "applicant_info": {
    "name": applicant.name,
    "dob": applicant.dateOfBirth,
    "income": applicant.annualIncome,
    "address": applicant.address.street & ", " & 
               applicant.address.city & ", " & 
               applicant.address.state & ", " & 
               applicant.address.postalCode & ", " & 
               applicant.address.country
  }
}`

export const inputSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "applicationId": {
      "type": "string"
    },
    "loanType": {
      "type": "string"
    },
    "amountRequested": {
      "type": "number"
    },
    "currency": {
      "type": "string"
    },
    "applicant": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string",
          "format": "date"
        },
        "annualIncome": {
          "type": "number"
        },
        "address": {
          "type": "object",
          "properties": {
            "street": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "postalCode": {
              "type": "string"
            },
            "country": {
              "type": "string"
            }
          },
          "required": ["street", "city", "state", "postalCode", "country"]
        }
      },
      "required": ["name", "dateOfBirth", "annualIncome", "address"]
    }
  },
  "required": ["applicationId", "loanType", "amountRequested", "currency", "applicant"]
}

`

export const outputSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "loan_application_id": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "amount": {
      "type": "number"
    },
    "currency": {
      "type": "string"
    },
    "applicant_info": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "dob": {
          "type": "string",
          "format": "date"
        },
        "income": {
          "type": "number"
        },
        "address": {
          "type": "string"
        }
      },
      "required": ["name", "dob", "income", "address"]
    }
  },
  "required": ["loan_application_id", "type", "amount", "currency", "applicant_info"]
}
`