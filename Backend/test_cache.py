"""
Test script to verify caching functionality
"""
import requests
import time

API_URL = "http://localhost:5000"

def test_caching():
    """Test that caching works correctly"""
    print("=" * 60)
    print("Testing Cache Functionality")
    print("=" * 60)
    
    # Test data
    test_request = {
        "text": "Hey, wanna grab lunch?",
        "target_tone": "professional",
        "context": "Replying to a colleague"
    }
    
    print("\n1. First request (should hit API)...")
    start = time.time()
    response1 = requests.post(
        f"{API_URL}/api/tone/quick-shift",
        json=test_request
    )
    time1 = time.time() - start
    
    if response1.status_code == 200:
        data1 = response1.json()
        print(f"✓ Status: {response1.status_code}")
        print(f"✓ Time: {time1:.2f}s")
        print(f"✓ Cached: {data1.get('cached', False)}")
        print(f"✓ Response: {data1['transformed_text'][:50]}...")
    else:
        print(f"✗ Error: {response1.status_code}")
        print(f"  {response1.text}")
        return
    
    print("\n2. Second request (should use cache)...")
    start = time.time()
    response2 = requests.post(
        f"{API_URL}/api/tone/quick-shift",
        json=test_request
    )
    time2 = time.time() - start
    
    if response2.status_code == 200:
        data2 = response2.json()
        print(f"✓ Status: {response2.status_code}")
        print(f"✓ Time: {time2:.2f}s")
        print(f"✓ Cached: {data2.get('cached', False)}")
        print(f"✓ Hit count: {data2.get('cache_hit_count', 0)}")
        print(f"✓ Response: {data2['transformed_text'][:50]}...")
        
        # Performance comparison
        speedup = time1 / time2 if time2 > 0 else 1
        print(f"\n📊 Performance:")
        print(f"   First request: {time1:.2f}s")
        print(f"   Cached request: {time2:.2f}s")
        print(f"   Speedup: {speedup:.1f}x faster")
        
        if data2.get('cached'):
            print(f"\n✅ Caching is working! Response was served from cache.")
        else:
            print(f"\n⚠️  Warning: Response was not cached")
    else:
        print(f"✗ Error: {response2.status_code}")
        print(f"  {response2.text}")
        return
    
    print("\n3. Third request (cache hit count should increase)...")
    response3 = requests.post(
        f"{API_URL}/api/tone/quick-shift",
        json=test_request
    )
    
    if response3.status_code == 200:
        data3 = response3.json()
        print(f"✓ Hit count: {data3.get('cache_hit_count', 0)}")
        if data3.get('cache_hit_count', 0) > data2.get('cache_hit_count', 0):
            print(f"✅ Hit count increased! Cache tracking is working.")
    
    print("\n" + "=" * 60)
    print("Cache Test Complete!")
    print("=" * 60)

if __name__ == '__main__':
    try:
        test_caching()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to Flask server.")
        print("   Make sure the server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
