using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public enum ProjectActivityType
    {
        CREATED,
        UPDATED,
        TITLE_UPDATED,
        MEMBER_ADDED,
        MEMBER_DELETED
    }
}
