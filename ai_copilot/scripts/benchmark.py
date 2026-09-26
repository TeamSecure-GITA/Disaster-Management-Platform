import time
from tools.registry import ToolRegistry

def main():
    registry = ToolRegistry()
    tools = registry.list_tools()
    print(f"[BENCHMARK] Benchmarking {len(tools)} Copilot tools...")
    start = time.time()
    for t_name in tools:
        t = registry.get_tool(t_name)
        res = t.execute()
        assert res.success, f"Tool {t_name} failed: {res.error}"
    duration = time.time() - start
    print(f"[BENCHMARK] Executed {len(tools)} tools in {duration:.3f}s. All passed.")

if __name__ == "__main__":
    main()
