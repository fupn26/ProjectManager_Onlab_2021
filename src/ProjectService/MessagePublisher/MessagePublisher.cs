using MessagePublisher.DTO;
using MessagingService.Settings;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MessagingService
{
    public class MessagePublisher : IMessagePublisher
    {

        private readonly IConnection _connetcion;
        private readonly IModel _channel;

        public MessagePublisher(IOptions<RabbitMqSettings> settings)
        {
            var factory = new ConnectionFactory() { HostName = settings.Value.Host,
                Port = settings.Value.Port, UserName = settings.Value.Username, Password = settings.Value.Password };

            _connetcion = factory.CreateConnection();
            _channel = _connetcion.CreateModel();

            _channel.QueueDeclare(queue: settings.Value.QueueName,
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);
        }

        ~MessagePublisher()
        {
            _channel.Close();
            _connetcion.Close();
        }

        public IBasicProperties CreateBasicProperties()
        {
            return _channel.CreateBasicProperties();
        }

        public void SendMessage(IMessage messageToSend, IBasicProperties props)
        {
            var messageJson = messageToSend.toJson();
            var body = Encoding.UTF8.GetBytes(messageJson);
            _channel.BasicPublish(exchange: "",
                     routingKey: "hello",
                     basicProperties: props,
                     body: body);
            Console.WriteLine(" [x] Sent {0}", messageJson);
        }
    }
}
