import { 
	createParamDecorator, 
	ExecutionContext,
} from '@nestjs/common'

const getCurrentUserByContext = (context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	return request.user;
}

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		return getCurrentUserByContext(context);
	}
)