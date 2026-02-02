import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")

if AI_PROVIDER == "ollama":
    # Ollama provides an OpenAI-compatible endpoint at /v1
    client = OpenAI(
        base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434/v1"),
        api_key="ollama", # Ollama doesn't require a real key
    )
    if LLM_MODEL == "gpt-4o": # If still default, use a common local model
        LLM_MODEL = "llama3"
else:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_contextual_insight(view: str, data: dict):
    """
    Generates a specialized AI insight based on the current view context.
    """
    if AI_PROVIDER == "openai" and not os.getenv("OPENAI_API_KEY"):
        return f"Insight: {view.capitalize()} data analysis is currently stable. (Simulation mode: Set OPENAI_API_KEY for real AI)"

    if view == "labor":
        prompt = f"""
        Analyze construction labor data:
        - Total Billable Hours: {data.get('billable')}
        - Total Overhead Hours: {data.get('overhead')}
        - Active Projects: {', '.join(data.get('projects', []))}
        
        Provide a concise 'Root Cause' insight for a Project Manager. 
        Use **Markdown** (bolding, lists) to highlight key points.
        **Do NOT use letter or email formatting** (no greetings like "Dear PM" or closures like "Sincerely"). 
        Provide a direct, dashboard-style analysis.
        """
    elif view == "automation":
        prompt = f"""
        Analyze current automation forensic scan results:
        - Critical Anomalies Found: {data.get('anomaly_count')}
        - Impacted Categories: {', '.join(data.get('categories', []))}
        
        Provide a high-urgency forensic insight about cost leakage or data integrity. 
        Use **Markdown** to emphasize critical findings.
        **Do NOT use greetings or email-style formatting.** Start with the analysis directly.
        """
    elif view == "finance":
        prompt = f"""
        Analyze project financial variances:
        - Projects Over Budget: {data.get('variance_projects')}
        - Total Active Projects: {data.get('total_projects')}
        
        Provide a strategic insight for a CFO about budget adherence and financial risk. 
        Use **Markdown** for professional formatting.
        **Strictly avoid letter/email structures.**
        """
    elif view == "finance":
        project_filter = data.get("project_filter", "all")
        
        if project_filter == "all":
            # Analyzing aggregated financial data
            total_revenue = data.get("total_revenue", 0)
            total_costs = data.get("total_costs", 0)
            total_profit = data.get("total_profit", 0)
            avg_margin = data.get("avg_margin", 0)
            
            prompt = f"""
            Analyze this aggregated financial performance across all projects:
            
            - Total Revenue: ${total_revenue:,.2f}
            - Total Costs: ${total_costs:,.2f}
            - Net Profit: ${total_profit:,.2f}
            - Average Profit Margin: {avg_margin:.1f}%
            
            Projects breakdown:
            {json.dumps(data.get('projects', []), indent=2)}
            
            Provide insights on:
            - Overall profitability trends
            - Which projects are most/least profitable
            - Labor cost efficiency (billable vs overhead ratio)
            - Specific recommendations for improving margins
            
            Use **Markdown** for professional formatting.
            **DO NOT write this as a letter or email.** No greetings, no sign-offs.
            """
        else:
            # Analyzing specific project
            project_name = data.get("project_name", "Unknown")
            revenue = data.get("revenue", 0)
            expenses = data.get("expenses", 0)
            labor_cost = data.get("labor_cost", 0)
            net_profit = data.get("net_profit", 0)
            profit_margin = data.get("profit_margin", 0)
            billable_hours = data.get("billable_hours", 0)
            overhead_hours = data.get("overhead_hours", 0)
            
            prompt = f"""
            Analyze the financial performance of project: **{project_name}**
            
            Financial Summary:
            - Revenue: ${revenue:,.2f}
            - Expenses: ${expenses:,.2f}
            - Labor Cost: ${labor_cost:,.2f}
            - Net Profit: ${net_profit:,.2f}
            - Profit Margin: {profit_margin:.1f}%
            
            Labor Metrics:
            - Billable Hours: {billable_hours:.1f}
            - Overhead Hours: {overhead_hours:.1f}
            - Efficiency Ratio: {(billable_hours / (billable_hours + overhead_hours) * 100) if (billable_hours + overhead_hours) > 0 else 0:.1f}%
            
            Expense Breakdown:
            {json.dumps(data.get('expense_breakdown', {}), indent=2)}
            
            Provide insights on:
            - Revenue vs cost analysis for this specific project
            - Profit margin health assessment
            - Labor efficiency evaluation
            - Specific actionable recommendations
            
            Use **Markdown** for professional formatting.
            **Output should be a direct report, NOT a letter or email.**
            """
    else:
        prompt = "Provide a general construction management insight about operational efficiency."

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "system", "content": "You are a professional construction intelligence expert. Provide direct, objective data insights. NEVER use greetings (e.g., 'Hello', 'Dear PM'), email-style formatting, or signatures. Jump directly into the analysis."},
                      {"role": "user", "content": prompt}],
            max_tokens=2048,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating {AI_PROVIDER} insight for {view}: {str(e)}"

def ask_custom_question(view: str, data: dict, question: str, history: list = None):
    """
    Answers a specific user question based on the provided data context and conversation history.
    """
    context_summary = ""
    if view == "labor":
        context_summary = f"Labor Data: Billable={data.get('billable')}, Overhead={data.get('overhead')}, Projects={data.get('projects')}"
    elif view == "finance":
        context_summary = f"Finance Data: Project={data.get('project_name')}, Profit Margin={data.get('profit_margin')}%, Revenue=${data.get('revenue')}"
    elif view == "automation":
        context_summary = f"Automation Data: Anomalies={data.get('anomaly_count')}, Categories={data.get('categories')}"
    
    # Base system message
    messages = [
        {"role": "system", "content": f"You are a professional construction intelligence expert. Answer questions directly using the provided context. Avoid greetings and sign-offs. Context Summary: {context_summary}"}
    ]
    
    # Append history if provided
    if history:
        for msg in history:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content")})
            
    # Add the current question
    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error answering question: {str(e)}"

def generate_construction_insight(billable_hours: float, overhead_hours: float, projects: list):
    """
    Legacy wrapper for labor insights.
    """
    return generate_contextual_insight("labor", {
        "billable": billable_hours,
        "overhead": overhead_hours,
        "projects": projects
    })

def analyze_anomaly(category: str, amount: float, history_avg: float, inflation_rate: float = 0.05):
    """
    Provides a natural language explanation and suggested action for a detected anomaly,
    considering the inflation baseline.
    Returns (explanation, suggested_action)
    """
    if AI_PROVIDER == "openai" and not os.getenv("OPENAI_API_KEY"):
        return f"Anomaly detected in {category}. Amount ${amount} exceeds the {inflation_rate*100}% inflation-adjusted baseline.", "Audit vendor for duplicate billing."

    prompt = f"""
    The system detected an anomaly in construction expenses:
    - Category: {category}
    - Current Amount: ${amount}
    - Historical Weekly Average: ${history_avg}
    - Inflation Baseline: {inflation_rate*100}%
    - Deviation (Inflation-Aware): {((amount - (history_avg*(1+inflation_rate))) / (history_avg*(1+inflation_rate))) * 100:.1f}%

    The system has already accounted for a {inflation_rate*100}% inflation baseline; this spike exceeds that trend.
    1. Explain why this is a risk beyond normal macroeconomic trends.
    2. Provide an immediate next step (ACTION).
    
    Format: [Explanation text] ACTION: [Action text]
    """

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "system", "content": "You are a forensic construction accountant. Be direct and analytical. NEVER use greetings, headers, or email-like signatures. Provide data analysis directly."},
                      {"role": "user", "content": prompt}],
            max_tokens=150
        )
        content = response.choices[0].message.content.strip()
        if "ACTION:" in content:
            explanation, action = content.split("ACTION:", 1)
            return explanation.strip(), action.strip()
        return content, "Review with accounting department."
    except Exception as e:
        return f"Anomaly breakdown error: {str(e)}", "Data check required."
