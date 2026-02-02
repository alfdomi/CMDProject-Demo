from typing import List, Dict
import statistics

def detect_expense_anomalies(invoices: List[Dict], annual_inflation: float = 0.05) -> List[Dict]:
    """
    Identifies anomalies in expenses using a statistical approach (Z-score),
    accounting for annual inflation as a baseline.
    """
    anomalies = []
    # Group by category
    categories = {}
    for inv in invoices:
        cat = inv['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(inv['amount'])

    for cat, amounts in categories.items():
        if len(amounts) < 2:
            continue
        
        avg = statistics.mean(amounts)
        stdev = statistics.stdev(amounts) if len(amounts) > 1 else 0
        
        # Inflation-adjusted average baseline
        # (Assuming the data represents a spread within a year)
        inflation_adjusted_avg = avg * (1 + annual_inflation)
        
        for amount in amounts:
            # Flag if > 2 standard deviations OR exceeds (avg + inflation + 15% margin)
            # This makes the detection more robust against standard macroeconomic trends
            if (stdev > 0 and (amount - avg) / stdev > 2) or (amount > avg * (1 + annual_inflation + 0.15)):
                anomalies.append({
                    "category": cat,
                    "amount": amount,
                    "history_avg": avg,
                    "inflation_adjusted_avg": inflation_adjusted_avg,
                    "spike_percentage": round(((amount - avg) / avg) * 100, 1),
                    "description": f"Significant spike in {cat} expenses, exceeding the {annual_inflation*100}% annual inflation baseline."
                })
    
    return anomalies
