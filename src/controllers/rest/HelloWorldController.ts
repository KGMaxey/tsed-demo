import {Controller} from "@tsed/di";
import { deserialize } from "@tsed/json-mapper";
import {DiscriminatorKey, DiscriminatorValue, Get, OneOf, Required, Returns, Property, Generics} from "@tsed/schema";

class Event {
  @DiscriminatorKey() // declare this property a discriminator key
  type: string;

  @Property()
  value: string;
}

@DiscriminatorValue("page_view") // or @DiscriminatorValue() value can be inferred by the class name
class PageView extends Event {
  @Required()
  url: string;
}

@DiscriminatorValue("action", "click_action")
class Action extends Event {
  @Required()
  event: string;
}

@DiscriminatorValue()
class CustomAction extends Event {
  @Required()
  event: string;

  @Property()
  meta: string;
}

type OneOfEvents = PageView | Action | CustomAction;

class EventContainer {
  @OneOf(Event)
  event: OneOfEvents
}

class ExplicitEvent {
  @Required()
  event: PageView
}

@Controller("/hello-world")
export class HelloWorldController {

  // THIS DOESN'T WORK - 'url' FIELD IS STRIPPED ON RETURN
  @Get("/")
  @Returns(200, EventContainer)
  get() {
    const result = deserialize<EventContainer>({
      event: {
        type: 'page_view',
        value: 'hello',
        url: 'world'
      }
    }, { type: EventContainer })

    // CONSOLE LOG CORRECTLY SHOWS 'url' FIELD IS PRESENT IN DESERIALIZED RESULT
    console.log(JSON.stringify(result))

    return result
  }

  // THIS WORKS
  @Get("/explicit")
  @Returns(200, ExplicitEvent)
  getExplicit() {
    const result = deserialize<ExplicitEvent>({
      event: {
        type: 'page_view',
        value: 'hello',
        url: 'world'
      }
    }, { type: ExplicitEvent })

    // CONSOLE LOG CORRECTLY SHOWS 'url' FIELD IS PRESENT IN DESERIALIZED RESULT
    console.log(JSON.stringify(result))

    return result
  }
}
