


interface props{
   sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}
const EmptyChatMessageInput = ({sendMessage,focusMode,setFocusMode}:props) => {
  return (
    <div>EmptyChatMessageInput</div>
  )
}

export default EmptyChatMessageInput