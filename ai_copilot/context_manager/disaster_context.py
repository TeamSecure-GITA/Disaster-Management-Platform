from schemas.context import DisasterContext

class DisasterContextTracker:
    def declare_emergency(self, context: DisasterContext, level: str = "severe") -> DisasterContext:
        context.warning_level = level
        context.is_declared_state_of_emergency = True
        return context
