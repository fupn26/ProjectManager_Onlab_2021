namespace ProjectAPI.Models
{
    public class CommentEmbedded
    {
        public UserEmbedded User { get; set; }

        public string Content { get; set; }
    }
}
