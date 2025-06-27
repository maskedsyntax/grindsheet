from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.leetcode_daily import fetch_leetcode_daily
import json
from io import StringIO
import sys
from app.utils.security import get_current_user
from app.schemas import TokenData

router = APIRouter(tags=["Daily Problems"])


@router.get("/leetcode-daily")
async def get_leetcode_daily(token_data: TokenData = Depends(get_current_user)):
    """Endpoint to fetch the current LeetCode daily problem."""
    try:
        # Capture the output from fetch_leetcode_daily
        fake_output = StringIO()
        sys.stdout = fake_output
        fetch_leetcode_daily()
        sys.stdout = sys.__stdout__
        output = json.loads(fake_output.getvalue())

        if "error" in output:
            if "connection" in str(output["error"]).lower():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Service temporarily unavailable. Please try again later.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch LeetCode daily problem. Please try again later.",
            )

        return output
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error: Invalid response format.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
