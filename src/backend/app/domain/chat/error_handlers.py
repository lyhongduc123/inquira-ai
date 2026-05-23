"""
Error and special case handlers for chat operations.
Handles gibberish input, no results, and other edge cases.
"""

from typing import AsyncGenerator

from redis import event
from app.domain.chat.responses import response_registry
from app.domain.conversations.service import ConversationService
from app.extensions import stream_event
from app.extensions.logger import create_logger
from app.extensions.stream import stream_like_llm
from .event_emitter import ChatEventEmitter
from app.domain.chat import event_emitter

logger = create_logger(__name__)


class ChatErrorHandler:
    """Handles error cases and special responses for chat"""
    @staticmethod
    async def handle_gibberish_input(
        conversation_service: ConversationService,
        conversation_id: str,
        user_id: int,
        query: str,
        event_emitter: ChatEventEmitter
    ) -> AsyncGenerator[str, None]:
        """
        Handle gibberish input with helpful introduction message.
        
        Args:
            conversation_service: Service for conversation operations
            conversation_id: Conversation ID
            user_id: User ID
            query: The gibberish query
            
        Yields:
            SSE events with introduction message
        """
        logger.info(f"Gibberish detected: {query}")
        async for evt in event_emitter.emit_thinking_event("Thinking how to answer..."):
            yield evt
            
        try:
            await conversation_service.add_message_to_conversation(
                conversation_id=conversation_id,
                user_id=user_id,
                message_text=query,
                role="user",
                auto_title=False,
            )
        except Exception as e:
            logger.error(f"Failed to save user message: {e}")
            async for evt in event_emitter.emit_error_event("Sorry, something went wrong while processing your message."):
                yield evt
        
        intro_message = response_registry.ResponseRegistry.get("gibberish")
        
        for evt in stream_like_llm(intro_message):
            async for event in event_emitter.emit_chunk_event(evt):
                yield event
        
        try:
            await conversation_service.add_message_to_conversation(
                conversation_id=conversation_id,
                user_id=user_id,
                message_text=intro_message,
                role="assistant",
                auto_title=False,
            )
        except Exception as e:
            logger.error(f"Failed to save assistant message: {e}")
            async for evt in event_emitter.emit_error_event("Sorry, something went wrong while saving the response."):
                yield evt
        
        async for evt in event_emitter.emit_done_event():
            yield evt
    
    @staticmethod
    async def handle_no_results(
        conversation_id: str,
        user_id: int,
        conversation_service: ConversationService,
        event_emitter: ChatEventEmitter
    ) -> AsyncGenerator[str, None]:
        """
        Handle when no papers are found.
        
        Args:
            conversation_id: Conversation ID
            user_id: User ID
            conversation_service: Service for conversation operations
            
        Yields:
            SSE events with no results message
        """
        msg = """I couldn't find any relevant research papers for your question. This could be because:

1. The topic might be too specific or recent
2. There may be no academic papers published on this subject
3. The papers may be behind paywalls or not indexed in the databases I have access to.

Please try asking a different question or rephrase your current one."""
 
        try:
            await conversation_service.add_message_to_conversation(
                conversation_id=conversation_id,
                user_id=user_id,
                message_text=msg,
                role="assistant",
                auto_title=False,
            )
        except Exception as e:
            logger.error(f"Failed to save no results message: {e}")
        
        # Stream the message
        async for evt in event_emitter.emit_chunk_event(msg):
            yield evt
        
        # Signal completion
        async for evt in event_emitter.emit_done_event():
            yield evt
