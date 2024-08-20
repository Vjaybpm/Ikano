import { FileOrFolder } from "../filelist/filelist.domain";

export const mockInputFolders: FileOrFolder[] = [ {
  id: 'input',
  label: 'input',
  children: [
    {
      id: 'input.json',
      label: 'input.json',
      contentType:  'json',
      contents: {
        "applicationId": "123456789",
        "loanType": "Personal Loan",
        "amountRequested": 5000,
        "currency": "USD",
        "applicant": {
          "name": "John Doe",
          "dateOfBirth": "1990-05-15",
          "annualIncome": 60000,
          "address": {
            "street": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "postalCode": "12345",
            "country": "USA"
          }
        }
      }
      ,
      errors: []
    },
    {
      id: 'input.java',
      label: 'input.java',
      contentType: 'string',
      contents: `import com.fasterxml.jackson.annotation.JsonProperty;

public class LoanApplicationInput {
    @JsonProperty("applicationId")
    private String applicationId;
    
    @JsonProperty("loanType")
    private String loanType;
    
    @JsonProperty("amountRequested")
    private int amountRequested;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("applicant")
    private ApplicantInfo applicantInfo;

    // Getters and setters
}

class ApplicantInfo {
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("dateOfBirth")
    private String dateOfBirth;
    
    @JsonProperty("annualIncome")
    private int annualIncome;
    
    @JsonProperty("address")
    private Address address;

    // Getters and setters
}

class Address {
    @JsonProperty("street")
    private String street;
    
    @JsonProperty("city")
    private String city;
    
    @JsonProperty("state")
    private String state;
    
    @JsonProperty("postalCode")
    private String postalCode;
    
    @JsonProperty("country")
    private String country;

    // Getters and setters
}
`,
      errors: []
    }
  ]
} ]

export const mockOutputFolders: FileOrFolder[] = [ {
  id: 'output',
  label: 'output',
  children: [
    {
      id: 'output.json',
      label: 'output.json',
      contentType: 'json',
      contents: {
        "loan_application_id": "123456789",
        "type": "personal",
        "amount": 5000,
        "currency": "USD",
        "applicant_info": {
          "name": "John Doe",
          "dob": "1990-05-15",
          "income": 60000,
          "address": "123 Main St, Anytown, CA, 12345, USA"
        }
      },
      errors: []
    },
    {
      id: 'output.java',
      label: 'output.java',
      contentType: 'string',
      contents: `import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class LoanApplication {
    @JsonProperty("loan_application_id")
    private String loanApplicationId;
    
    private String type;
    private double amount;
    private String currency;
    
    @JsonProperty("applicant_info")
    private ApplicantInfo applicantInfo;

    // Constructors, getters, and setters
}

class ApplicantInfo {
    private String name;
    
    private Date dob; // Consider using LocalDate instead if you're using Java 8 or later
    
    private double income;
    private String address;

    // Constructors, getters, and setters
}`,
      errors: []
    }
  ]
} ]
