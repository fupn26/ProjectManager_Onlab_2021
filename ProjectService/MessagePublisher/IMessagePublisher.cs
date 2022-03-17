using MessagePublisher.DTO;
using RabbitMQ.Client;

namespace MessagingService
{
    public interface IMessagePublisher
    {
        IBasicProperties CreateBasicProperties();
        void SendMessage(IMessage messageToSend, IBasicProperties props);
    }
}
