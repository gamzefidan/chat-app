export default function Message(props) {
  return (
    <div>
      <strong>{props.name}:</strong> {props.message}
    </div>
  );
}
