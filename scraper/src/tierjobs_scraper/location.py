"""Location normalization utilities.

Provides consistent city/location names across job listings.
"""

import re

# Common city abbreviations and mappings
CITY_MAPPINGS = {
    # Major US cities
    "new york": "NYC",
    "new york city": "NYC",
    "manhattan": "NYC",
    "brooklyn": "NYC",
    "san francisco": "SF",
    "san francisco bay area": "SF Bay Area",
    "bay area": "SF Bay Area",
    "los angeles": "LA",
    "washington dc": "DC",
    "washington, dc": "DC",
    "washington d.c.": "DC",
    "seattle": "Seattle",
    "boston": "Boston",
    "austin": "Austin",
    "chicago": "Chicago",
    "denver": "Denver",
    "miami": "Miami",
    "atlanta": "Atlanta",
    "portland": "Portland",
    "philadelphia": "Philly",
    
    # Bay Area specifics
    "palo alto": "Palo Alto",
    "mountain view": "Mountain View",
    "menlo park": "Menlo Park",
    "sunnyvale": "Sunnyvale",
    "san jose": "San Jose",
    "cupertino": "Cupertino",
    "redwood city": "Redwood City",
    "south san francisco": "South SF",
    
    # International
    "london": "London",
    "toronto": "Toronto",
    "vancouver": "Vancouver",
    "dublin": "Dublin",
    "amsterdam": "Amsterdam",
    "berlin": "Berlin",
    "paris": "Paris",
    "singapore": "Singapore",
    "tokyo": "Tokyo",
    "sydney": "Sydney",
    "tel aviv": "Tel Aviv",
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "hyderabad": "Hyderabad",
    "mumbai": "Mumbai",
}

# State abbreviations (for stripping)
US_STATES = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY",
}


def normalize_location(location: str | None) -> str | None:
    """Normalize a location string to a consistent format.
    
    Examples:
        "New York, NY" -> "NYC"
        "San Francisco, California" -> "SF"
        "Remote - US" -> "Remote (US)"
        "London, United Kingdom" -> "London"
    """
    if not location:
        return None
    
    original = location
    loc = location.strip()
    
    # Handle remote variations
    remote_match = re.match(r'^remote\s*[-–—/]\s*(.+)$', loc, re.IGNORECASE)
    if remote_match:
        region = remote_match.group(1).strip()
        # Simplify region
        if region.lower() in ["united states", "usa", "us"]:
            return "Remote (US)"
        elif region.lower() in ["united kingdom", "uk"]:
            return "Remote (UK)"
        elif region.lower() == "emea":
            return "Remote (EMEA)"
        elif region.lower() == "apac":
            return "Remote (APAC)"
        return f"Remote ({region})"
    
    if loc.lower() == "remote":
        return "Remote"
    
    # Split by comma to get city part
    parts = [p.strip() for p in loc.split(",")]
    city_part = parts[0].lower()
    
    # Check direct city mapping
    if city_part in CITY_MAPPINGS:
        return CITY_MAPPINGS[city_part]
    
    # Check if full location maps
    full_lower = loc.lower()
    for city, abbrev in CITY_MAPPINGS.items():
        if full_lower.startswith(city):
            return abbrev
    
    # Strip state/country suffix if city is recognized
    if len(parts) >= 2:
        state_or_country = parts[1].lower().strip()
        # If second part is a US state, we've already captured city
        if state_or_country in US_STATES or state_or_country in US_STATES.values():
            # City wasn't in our mapping, return as-is but cleaned
            return parts[0].title()
    
    # Return original if no transformation needed
    return original


def extract_remote_info(location: str | None) -> tuple[bool, str | None]:
    """Check if location indicates remote work.
    
    Returns:
        (is_remote, remote_region) - e.g., (True, "US") or (False, None)
    """
    if not location:
        return False, None
    
    loc_lower = location.lower()
    
    # Clear remote indicators
    if "remote" in loc_lower:
        # Try to extract region
        match = re.search(r'remote\s*[-–—/]\s*(\w+)', loc_lower)
        if match:
            return True, match.group(1).upper()
        return True, None
    
    # Hybrid/flexible indicators
    if any(x in loc_lower for x in ["hybrid", "flexible", "work from home", "wfh"]):
        return True, None
    
    return False, None


def get_city_from_location(location: str | None) -> str | None:
    """Extract just the city name from a location string."""
    if not location:
        return None
    
    # Normalize first
    normalized = normalize_location(location)
    if not normalized or normalized.startswith("Remote"):
        return None
    
    return normalized
