import Image from '@site/src/components/Image';

# The Chat Interface

The Kilo Code chat interface is your primary way of interacting with it. It's located in the Kilo Code panel, which you can open by clicking the Kilo Code icon (<img src="/docs/img/kilo-v1.svg" width="12" />) in the VS Code Side Bar.

## Components of the Chat Interface

The chat interface consists of the following main elements:

1. **Chat / Task History:** This area displays the conversation history between you and Kilo Code, or if you are not in a current task the history of all of the tasks you've created.  It shows your requests, Kilo Code's responses, and any actions taken (like file edits or command executions).

2. **Input Field:** This is where you type your tasks and questions for Kilo Code.  You can use [plain English to communicate what you want Kilo Code to do](/basic-usage/typing-your-requests).

3. **Action Buttons:** These buttons appear below the input field and allow you to approve or reject Kilo Code's proposed actions.  The available buttons change depending on the context and your [auto-approval settings](/features/auto-approving-actions).

4. **Send Button:** This looks like a small plane and it's located to the far right of the input field. This sends messages to Kilo after you've typed them. Alternatively you can just press `Enter`

5. **Plus Button:** The plus button is located at the top in the header, and it starts a new task session.

6. **Settings Button:** The settings button is a gear, and it's used for opening the settings to customize features or behavior.

7. **Mode Selector:** The mode selector is a dropdown located to the left of the chat input field. It is used for selecting which mode Kilo should use for your tasks.

<Image src="/docs/img/the-chat-interface/the-chat-interface-1.png" alt="Chat interface components labeled with callouts" width="750" />
*The key components of the Kilo Code chat interface.*

## Interacting with Messages

* **Clickable Links:** File paths, URLs, and other mentions in the chat history are clickable.  Clicking a file path will open the file in the editor.  Clicking a URL will open it in your default browser.
* **Copying Text:** You can copy text from the chat history by selecting it and using the standard copy command (`Ctrl/Cmd + C`).  Some elements, like code blocks, have a dedicated "Copy" button.
* **Expanding and Collapsing**: Click on a message to expand or collapse it.

## Status Indicators

* **Loading Spinner:**  When Kilo Code is processing a request, you'll see a loading spinner.
* **Error Messages:**  If an error occurs, a red error message will be displayed.
* **Success Messages:** Green messages indicate successful completion of actions.
