from flask import Flask, request, jsonify
from flask_cors import CORS
import tenseal as ts

MIN_CREDIT_SCORE = 500
MAX_LOAN_AMOUNT = 500000
MAX_DTI = 36
MAX_LTV = 80 

app = Flask(__name__)
CORS(app)

@app.route('/api/calculate-interest', methods=['POST'])
def calculate_interest():
    try:
        # Parse request data
        data = request.json
        principal = float(data['principal'])
        rate = float(data['rate'])
        time = float(data['time'])

        # Encrypt values using TenSEAL
        # Set encryption parameters
        context = ts.context(
            ts.SCHEME_TYPE.CKKS, 
            poly_modulus_degree=8192, 
            coeff_mod_bit_sizes=[60, 40, 40, 60]
        )
        context.global_scale = 2**40
        context.generate_galois_keys()

        # Encrypt the inputs
        encrypted_principal = ts.ckks_vector(context, [principal])
        encrypted_rate = ts.ckks_vector(context, [rate / 100])  # Rate as a fraction
        encrypted_time = ts.ckks_vector(context, [time])

        # Perform homomorphic encrypted computation: interest = principal * rate * time
        encrypted_interest = encrypted_principal * encrypted_rate * encrypted_time

        # Decrypt the result for demonstration
        decrypted_interest = encrypted_interest.decrypt()

        # Log the encrypted and decrypted values
        print(f"Encrypted Principal: {encrypted_principal.serialize()}")
        print(f"Encrypted Rate: {encrypted_rate.serialize()}")
        print(f"Encrypted Time: {encrypted_time.serialize()}")
        print(f"Decrypted Interest: {decrypted_interest}")

        # Return results to the frontend
        return jsonify({
            "success": True,
            "encrypted_values": {
                "principal": encrypted_principal.serialize().hex(),
                "rate": encrypted_rate.serialize().hex(),
                "time": encrypted_time.serialize().hex(),
                "interest": encrypted_interest.serialize().hex()
            },
            "decrypted_interest": decrypted_interest[0]  # Optional: return plaintext for user
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/loan-approval', methods=['POST'])
def loan_approval():
    try:
        # Parse request data
        data = request.json
        credit_score = float(data['credit_score'])
        loan_amount = float(data['loan_amount'])
        income_inverse = float(data['income'])  # Receive inverse of income
        total_monthly_debt = float(data['total_monthly_debt'])
        appraised_value_inverse = float(data['appraised_property_value'])  # Receive inverse of property value

        # Encrypt values using TenSEAL
        context = ts.context(
            ts.SCHEME_TYPE.CKKS, 
            poly_modulus_degree=8192, 
            coeff_mod_bit_sizes=[60, 40, 40, 60]
        )
        context.global_scale = 2**40
        context.generate_galois_keys()

        # Encrypt the inputs
        encrypted_credit_score = ts.ckks_vector(context, [credit_score])
        encrypted_loan_amount = ts.ckks_vector(context, [loan_amount])
        encrypted_income_inverse = ts.ckks_vector(context, [income_inverse])  # Encrypt the inverse of income
        encrypted_total_monthly_debt = ts.ckks_vector(context, [total_monthly_debt])
        encrypted_appraised_value_inverse = ts.ckks_vector(context, [appraised_value_inverse])  # Encrypt the inverse of property value

        # Calculate DTI (Debt-to-Income) ratio using the inverse of income
        encrypted_dti = encrypted_total_monthly_debt * encrypted_income_inverse * 100

        # Calculate LTV (Loan-to-Value) ratio using the inverse of property value
        encrypted_ltv = encrypted_loan_amount * encrypted_appraised_value_inverse * 100

        # Decrypt DTI, LTV, and credit/loan checks for decision-making
        decrypted_dti = encrypted_dti.decrypt()  # Decrypt DTI
        decrypted_ltv = encrypted_ltv.decrypt()  # Decrypt LTV
        decrypted_credit_score = encrypted_credit_score.decrypt()
        decrypted_loan_amount = encrypted_loan_amount.decrypt()
        # Debugging: Log encrypted values and decrypted results
        print(f"Decrypted DTI: {decrypted_dti[0]}")
        print(f"Decrypted LTV: {decrypted_ltv[0]}")

        # Loan approval logic using if-else based on conditions:
        if (decrypted_credit_score[0] >= MIN_CREDIT_SCORE and 
            decrypted_loan_amount[0] <= MAX_LOAN_AMOUNT and 
            decrypted_dti[0] <= MAX_DTI and 
            decrypted_ltv[0] <= MAX_LTV):
            loan_approved = True
        else:
            loan_approved = False
        print(f"Loan Approved: {loan_approved}")
        # Return results to the frontend, without encrypting the loan approval
        return jsonify({
            "success": True,
            "loan_approved": loan_approved,  # Send approval status directly (not encrypted)
            "encrypted_values": {
                "credit_score": encrypted_credit_score.serialize().hex(),
                "loan_amount": encrypted_loan_amount.serialize().hex(),
                "income": encrypted_income_inverse.serialize().hex(),
                "total_monthly_debt": encrypted_total_monthly_debt.serialize().hex(),
                "appraised_property_value": encrypted_appraised_value_inverse.serialize().hex(),
                "dti": encrypted_dti.serialize().hex(),
                "ltv": encrypted_ltv.serialize().hex()
            },
            "dti": decrypted_dti[0],  # Return decrypted DTI for user to view
            "ltv": decrypted_ltv[0]   # Return decrypted LTV for user to view
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
