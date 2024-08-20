public class LoanApplication {
    private String applicationId;
    private String loanType;
    private int amountRequested;
    private String currency;
    private Applicant applicant;
    public LoanApplication(String applicationId, String loanType, int amountRequested, String currency, Applicant applicant) {
        this.applicationId = applicationId;
        this.loanType = loanType;
        this.amountRequested = amountRequested;
        this.currency = currency;
        this.applicant = applicant;
    }
// Constructors, getters, and setters
    public String getApplicationId() {
        return applicationId;
    }
    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }
    public String getLoanType() {
        return loanType;
    }
    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }
    public int getAmountRequested() {
        return amountRequested;
    }
    public void setAmountRequested(int amountRequested) {
        this.amountRequested = amountRequested;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public Applicant getApplicant() {
        return applicant;
    }
    public void setApplicant(Applicant applicant) {
        this.applicant = applicant;
    }
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        if (!super.equals(object)) return false;
        LoanApplication that = (LoanApplication) object;
        return amountRequested == that.amountRequested && java.util.Objects.equals(applicationId, that.applicationId) && java.util.Objects.equals(loanType, that.loanType) && java.util.Objects.equals(currency, that.currency) && java.util.Objects.equals(applicant, that.applicant);
    }
    public int hashCode() {
        return Objects.hash(super.hashCode(), applicationId, loanType, amountRequested, currency, applicant);
    }
}

public class Applicant {
    private String name;
    private String dateOfBirth;
    private String employmentStatus;
    private int annualIncome;
    private Address address;

    // Constructors, getters, and setters
}

public class Address {
    private String street;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    public Address(String street, String city, String state, String country, String postalCode) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.country = country;
        this.postalCode = postalCode;
    }
    public String getStreet() {
        return street;
    }
    public void setStreet(String street) {
        this.street = street;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getState() {
        return state;
    }
    public void setState(String state) {
        this.state = state;
    }
    public String getCountry() {
        return country;
    }
    public void setCountry(String country) {
        this.country = country;
    }
    public String getPostalCode() {
        return postalCode;
    }
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        if (!super.equals(object)) return false;
        Address address = (Address) object;
        return java.util.Objects.equals(street, address.street) && java.util.Objects.equals(city, address.city) && java.util.Objects.equals(state, address.state) && java.util.Objects.equals(country, address.country) && java.util.Objects.equals(postalCode, address.postalCode);
    }
    public int hashCode() {
        return Objects.hash(super.hashCode(), street, city, state, country, postalCode);
    }
    // Constructors, getters, and setters
}
public class LoanApplicationTransformed {
    private String loan_application_id;
    private String type;
    private int amount;
    private String currency;
    private ApplicantInfo applicant_info;

    // Constructors, getters, and setters
}

public class ApplicantInfo {
    private String name;
    private String dob;
    private int income;
    private String address;
    public ApplicantInfo(String name, String dob, int income, String address) {
        this.name = name;
        this.dob = dob;
        this.income = income;
        this.address = address;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getDob() {
        return dob;
    }
    public void setDob(String dob) {
        this.dob = dob;
    }
    public int getIncome() {
        return income;
    }
    public void setIncome(int income) {
        this.income = income;
    }
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        if (!super.equals(object)) return false;
        ApplicantInfo that = (ApplicantInfo) object;
        return income == that.income && java.util.Objects.equals(name, that.name) && java.util.Objects.equals(dob, that.dob) && java.util.Objects.equals(address, that.address);
    }
    public int hashCode() {
        return Objects.hash(super.hashCode(), name, dob, income, address);
    }
    // Constructors, getters, and setters
}
public class LoanApplicationTransformer {

    public static LoanApplicationTransformed transform(LoanApplication input) {
        LoanApplicationTransformed output = new LoanApplicationTransformed();

        output.setLoan_application_id(input.getApplicationId());
        output.setType(input.getLoanType().toLowerCase().split(" ")[0]);
        output.setAmount(input.getAmountRequested());
        output.setCurrency(input.getCurrency());

        ApplicantInfo applicantInfo = new ApplicantInfo();
        Applicant applicant = input.getApplicant();

        applicantInfo.setName(applicant.getName());
        applicantInfo.setDob(applicant.getDateOfBirth());
        applicantInfo.setIncome(applicant.getAnnualIncome());

        Address address = applicant.getAddress();
        String fullAddress = String.format("%s, %s, %s, %s, %s",
                address.getStreet(), address.getCity(), address.getState(),
                address.getPostalCode(), address.getCountry());
        applicantInfo.setAddress(fullAddress);

        output.setApplicant_info(applicantInfo);

        return output;
    }
}
