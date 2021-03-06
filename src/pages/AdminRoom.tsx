import { useParams, useHistory } from 'react-router-dom';
import logoImg from '../assets/images/logo.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import deleteImg from '../assets/images/delete.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';


type RoomParams = {
    id: string
}

export function AdminRoom() {
    // const { user } = useAuth();
    const history = useHistory();
    const params = useParams<RoomParams>();
    const roomId = params.id;
    const { questions, title } = useRoom(roomId);

    async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true
        });
    }

    async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true
        });
    }

    async function handleEndRoom() {
        if (window.confirm("Tem certeza que você deseja encerrar essa sala?")) {
            database.ref(`rooms/${roomId}`).update({
                endedAt: new Date()
            })

            history.push('/')
        }
    }

    async function handleDeleteQuestion(questionId: string) {
        if (window.confirm("Tem certeza que você deseja excluir essa pergunta?")) {
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        }
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode name={title} code={roomId} />
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className={"room-title"}>
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && (
                        <span>
                            {questions.length}
                            <label className="labelQtdPerguntas"> pergunta(s)</label>
                        </span>
                    )}
                </div>

                <div className="question-list">
                    {questions.length == 0 && (
                        <h3>
                            No momento, não há perguntas nessa sala...
                        </h3>
                    )}
                    {questions.length > 0 && questions.map(question => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                                isAnswered={question.isAnswered}
                                isHighlighted={question.isHighlighted}
                                footerClassName={"admin-footer"}
                            >
                                {question.likeCount > 0 && (<span className="likeSpan">{question.likeCount} like(s)</span>)}
                                {!question.isAnswered && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                        >
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleHighlightQuestion(question.id)}
                                        >
                                            <img src={answerImg} alt="Dar destaque à pergunta" />
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>

                            </Question>
                        );
                    })}
                </div>
            </main>
        </div >
    )
}