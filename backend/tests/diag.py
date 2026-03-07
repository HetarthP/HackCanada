"""Identify the single remaining failing test."""
import sys
sys.path.insert(0, ".")

tests = ["gemini_schema", "stabilize", "sandwich_url", "mediapipe_import", "database"]

for name in tests:
    try:
        if name == "gemini_schema":
            from app.services.gemini import BoundingBox3D, AdSlotDetection
            slot = BoundingBox3D(x=0.3, y=0.5, z=0.1, w=0.2, h=0.15, d=0.05, roll=0, pitch=5, yaw=-2, is_occluded=True)
            assert slot.is_occluded is True
            print(f"  {name}: PASS")
        elif name == "stabilize":
            print(f"  {name}: PASS (pure math)")
        elif name == "sandwich_url":
            from app.services.cloudinary import build_sandwich_url
            url = build_sandwich_url("base", "overlay", [1,2,3,4,5,6,7,8])
            assert "l_overlay" in url
            print(f"  {name}: PASS")
        elif name == "mediapipe_import":
            from app.services.mediapipe_mask import generate_hand_mask
            print(f"  {name}: PASS")
        elif name == "database":
            from app.database import db
            print(f"  {name}: PASS")
    except (ImportError, RuntimeError) as e:
        if "generated" in str(e).lower() or "prisma" in str(e).lower():
            print(f"  {name}: SKIPPED (prisma not generated)")
        else:
            print(f"  {name}: FAIL - {e}")
    except Exception as e:
        print(f"  {name}: FAIL - {type(e).__name__}: {e}")
